"""Shared direct-mode test configuration."""

from pathlib import Path
import sys
from typing import Any, Callable, Optional

import pytest

from gltest.direct.loader import deploy_contract
from gltest.direct.vm import VMContext


CONTRACT_PATH = Path(__file__).resolve().parents[2] / "contracts" / "equigrant.py"


def _clear_genlayer_modules() -> None:
    for name in list(sys.modules):
        if name == "genlayer" or name.startswith("genlayer."):
            del sys.modules[name]


def _address_bytes(value: Any) -> Any:
    address_bytes = getattr(value, "as_bytes", None)
    if address_bytes is not None:
        return address_bytes
    return value


def pytest_configure(config: pytest.Config) -> None:
    """Load the GenLayer direct-mode SDK selected by the contract header."""
    try:
        from gltest.direct.sdk_loader import setup_sdk_paths
    except ImportError as exc:
        raise RuntimeError("genlayer-test is required for direct contract tests") from exc

    setup_sdk_paths(CONTRACT_PATH)
    _clear_genlayer_modules()


@pytest.fixture
def direct_deploy(direct_vm: VMContext) -> Callable[..., Any]:
    """Deploy with a clean GenLayer module cache for each direct-mode load."""
    def _deploy(
        contract_path: str,
        *args: Any,
        sdk_version: Optional[str] = None,
        **kwargs: Any,
    ) -> Any:
        path = Path(contract_path)

        if not path.is_absolute():
            if path.exists():
                path = path.resolve()
            else:
                for base in [
                    Path.cwd(),
                    Path.cwd() / "contracts",
                    Path.cwd() / "intelligent-contracts",
                ]:
                    candidate = base / contract_path
                    if candidate.exists():
                        path = candidate.resolve()
                        break

        direct_vm.sender = _address_bytes(direct_vm.sender)
        direct_vm.origin = _address_bytes(direct_vm.origin)
        _clear_genlayer_modules()
        return deploy_contract(path, direct_vm, *args, sdk_version=sdk_version, **kwargs)

    return _deploy
