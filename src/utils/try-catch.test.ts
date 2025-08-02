import { describe, it, expect } from "bun:test";
import { tryCatch } from "./try-catch";

describe("tryCatch", () => {
	it("should return success result for resolved promise", async () => {
		const result = await tryCatch(Promise.resolve("success"));

		expect(result.data).toBe("success");
		expect(result.error).toBeNull();
	});

	it("should return failure result for rejected promise", async () => {
		const error = new Error("test error");
		const result = await tryCatch(Promise.reject(error));

		expect(result.data).toBeNull();
		expect(result.error).toBe(error);
	});

	it("should handle async function that throws", async () => {
		const asyncFunction = async () => {
			throw new Error("async error");
		};

		const result = await tryCatch(asyncFunction());

		expect(result.data).toBeNull();
		expect(result.error).toBeInstanceOf(Error);
		expect((result.error as Error).message).toBe("async error");
	});

	it("should handle different data types", async () => {
		const objectResult = await tryCatch(
			Promise.resolve({ id: 1, name: "test" }),
		);
		const numberResult = await tryCatch(Promise.resolve(42));
		const booleanResult = await tryCatch(Promise.resolve(true));

		expect(objectResult.data).toEqual({ id: 1, name: "test" });
		expect(numberResult.data).toBe(42);
		expect(booleanResult.data).toBe(true);
	});
});
