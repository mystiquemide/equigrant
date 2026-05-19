def address_text(value) -> str:
    if isinstance(value, bytes):
        return f"0x{value.hex()}"

    text = str(value)
    if text.startswith('Address("') and text.endswith('")'):
        return text[len('Address("'):-2]

    return text
