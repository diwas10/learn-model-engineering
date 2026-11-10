import sys
import io
import time
import traceback
import multiprocessing
from typing import Dict, Any, List, Optional

ALLOWED_MODULES = {"numpy", "np", "torch", "math", "scipy", "typing", "collections", "itertools", "functools", "random", "time"}

def _safe_import(name, globals=None, locals=None, fromlist=(), level=0):
    root_pkg = name.split('.')[0]
    if root_pkg not in ALLOWED_MODULES:
        raise ImportError(f"Import of '{name}' is restricted in the execution sandbox. Allowed: {sorted(list(ALLOWED_MODULES))}")
    return __import__(name, globals, locals, fromlist, level)

def _target_exec(code: str, test_assertions: List[str], conn):
    """Worker function executed in separate process for sandbox isolation."""
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    redirected_out = io.StringIO()
    redirected_err = io.StringIO()
    sys.stdout = redirected_out
    sys.stderr = redirected_err

    # Build safe namespace
    safe_builtins = {
        '__builtins__': {
            '__import__': _safe_import,
            'abs': abs, 'all': all, 'any': any, 'bool': bool, 'dict': dict,
            'enumerate': enumerate, 'filter': filter, 'float': float,
            'int': int, 'isinstance': isinstance, 'len': len, 'list': list,
            'map': map, 'max': max, 'min': min, 'print': print,
            'range': range, 'round': round, 'set': set, 'sorted': sorted,
            'str': str, 'sum': sum, 'tuple': tuple, 'zip': zip,
            'Exception': Exception, 'ValueError': ValueError, 'TypeError': TypeError,
            'AssertionError': AssertionError, 'IndexError': IndexError, 'KeyError': KeyError,
            'RuntimeError': RuntimeError, 'ZeroDivisionError': ZeroDivisionError,
            'True': True, 'False': False, 'None': None
        }
    }

    try:
        import numpy as np
        safe_builtins['np'] = np
        safe_builtins['numpy'] = np
    except ImportError:
        pass

    try:
        import torch
        safe_builtins['torch'] = torch
    except ImportError:
        pass

    try:
        import math
        safe_builtins['math'] = math
    except ImportError:
        pass

    local_vars: Dict[str, Any] = {}
    test_results = []
    error_msg = None
    all_tests_passed = True

    try:
        exec(code, safe_builtins, local_vars)
        
        # Run test cases
        for idx, assertion in enumerate(test_assertions):
            t_start = time.perf_counter()
            test_passed = False
            test_err = None
            try:
                # Execute assertion with access to both globals and locals
                exec(assertion, safe_builtins, local_vars)
                test_passed = True
            except Exception as te:
                test_passed = False
                test_err = f"{type(te).__name__}: {str(te)}"
                all_tests_passed = False
            t_dur = (time.perf_counter() - t_start) * 1000.0
            test_results.append({
                "index": idx,
                "passed": test_passed,
                "error": test_err,
                "duration_ms": t_dur
            })

    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        all_tests_passed = False

    sys.stdout = old_stdout
    sys.stderr = old_stderr

    # Collect clean variables
    clean_vars = {}
    for k, v in local_vars.items():
        if k.startswith('_'):
            continue
        try:
            if isinstance(v, (int, float, str, bool, list, dict)):
                clean_vars[k] = str(v)[:200]
            elif hasattr(v, 'shape'):
                clean_vars[k] = f"{type(v).__name__} shape={list(v.shape)} dtype={str(getattr(v, 'dtype', ''))}"
            else:
                clean_vars[k] = str(type(v).__name__)
        except Exception:
            pass

    conn.send({
        "stdout": redirected_out.getvalue()[:10000],
        "stderr": redirected_err.getvalue()[:10000],
        "error": error_msg,
        "test_results": test_results,
        "all_tests_passed": all_tests_passed,
        "variables": clean_vars
    })
    conn.close()


def execute_sandboxed_code(code: str, test_assertions: List[str] = [], timeout_seconds: float = 4.0) -> Dict[str, Any]:
    """Execute python code in an isolated sub-process with hard timeout and output capture."""
    parent_conn, child_conn = multiprocessing.Pipe()
    p = multiprocessing.Process(target=_target_exec, args=(code, test_assertions, child_conn))
    
    start_time = time.perf_counter()
    p.start()
    p.join(timeout=timeout_seconds)

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    if p.is_alive():
        p.terminate()
        p.join(timeout=0.2)
        if p.is_alive():
            p.kill()
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Execution timed out after {timeout_seconds:.1f} seconds. Check for infinite loops or expensive calculations.",
            "error": "TimeoutError",
            "execution_time_ms": elapsed_ms,
            "test_results": [],
            "all_tests_passed": False,
            "variables": {}
        }

    if parent_conn.poll():
        res = parent_conn.recv()
        success = res["error"] is None and res["all_tests_passed"]
        return {
            "success": success,
            "stdout": res["stdout"],
            "stderr": res["stderr"],
            "error": res["error"],
            "execution_time_ms": elapsed_ms,
            "test_results": res["test_results"],
            "all_tests_passed": res["all_tests_passed"],
            "variables": res["variables"]
        }
    else:
        return {
            "success": False,
            "stdout": "",
            "stderr": "Execution process terminated unexpectedly.",
            "error": "ProcessCrash",
            "execution_time_ms": elapsed_ms,
            "test_results": [],
            "all_tests_passed": False,
            "variables": {}
        }
