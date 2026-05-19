import sys
from pathlib import Path

import pytest


STD_LIB_PATH = Path(
    "/home/mystiquemide/.cache/gltest-direct/extracted/v0.2.16/"
    "py-lib-genlayer-std/11rhn002yfajawsz7fai6mykznbxkxs6l91iskj5cm82c92qhy3v"
)


@pytest.fixture(autouse=True)
def use_extracted_genlayer_stdlib():
    path = str(STD_LIB_PATH)
    if path in sys.path:
        sys.path.remove(path)
    sys.path.insert(0, path)

    for module_name in list(sys.modules):
        if module_name == "genlayer" or module_name.startswith("genlayer."):
            del sys.modules[module_name]

    yield
