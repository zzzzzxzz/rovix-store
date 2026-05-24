type Shape = Record<string, FieldValidator>;

class ValidationError extends Error {}

class FieldValidator {
  private rules: Array<(value: unknown) => string | null> = [];

  string() {
    this.rules.push((value) => (typeof value === "string" ? null : "Campo inválido."));
    return this;
  }

  min(size: number) {
    this.rules.push((value) => (typeof value === "string" && value.trim().length >= size ? null : "Campo muito curto."));
    return this;
  }

  email() {
    this.rules.push((value) =>
      typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "E-mail inválido."
    );
    return this;
  }

  parse(value: unknown) {
    for (const rule of this.rules) {
      const error = rule(value);
      if (error) throw new ValidationError(error);
    }

    return typeof value === "string" ? value.trim() : value;
  }
}

export const z = {
  string() {
    return new FieldValidator().string();
  },
  object<TShape extends Shape>(shape: TShape) {
    return {
      parse(input: unknown) {
        if (!input || typeof input !== "object") {
          throw new ValidationError("Dados inválidos.");
        }

        const source = input as Record<string, unknown>;
        return Object.fromEntries(
          Object.entries(shape).map(([key, validator]) => [key, validator.parse(source[key])])
        ) as { [K in keyof TShape]: string };
      }
    };
  }
};
