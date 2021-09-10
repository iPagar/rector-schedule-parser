import parse from "../../index";
jest.useFakeTimers();

test("parse", () => {
  expect(parse("src/__tests__/mock/АДБ-21-09.pdf")).toBeDefined();
});
