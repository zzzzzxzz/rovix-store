type PixField = {
  id: string;
  value: string;
};

function readPixFields(code: string): PixField[] {
  const fields: PixField[] = [];
  let index = 0;

  while (index + 4 <= code.length) {
    const id = code.slice(index, index + 2);
    const length = Number(code.slice(index + 2, index + 4));

    if (!/^\d{2}$/.test(id) || !Number.isFinite(length) || length < 0) break;

    const valueStart = index + 4;
    const valueEnd = valueStart + length;
    const value = code.slice(valueStart, valueEnd);

    if (value.length !== length) break;

    fields.push({ id, value });
    index = valueEnd;
  }

  return fields;
}

function findField(code: string, id: string) {
  return readPixFields(code).find((field) => field.id === id)?.value || "";
}

export function getPixReceiver(code: string) {
  return {
    name: findField(code, "59"),
    city: findField(code, "60"),
    country: findField(code, "58")
  };
}
