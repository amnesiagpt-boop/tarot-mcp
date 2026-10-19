import { playFlip, playFlipOut } from "../flip.js";

it("can deal a visible card into the same position after an animated return", () => {
  vi.useFakeTimers();
  const node = document.createElement("div");
  document.body.append(node);
  vi.spyOn(node, "getBoundingClientRect").mockReturnValue({
    x: 100,
    y: 40,
    left: 100,
    top: 40,
    width: 60,
    height: 90,
    right: 160,
    bottom: 130,
    toJSON: () => ({}),
  });
  const target = { left: 400, top: 300, width: 72, height: 108, rotation: 12 };
  const returned = vi.fn();
  playFlipOut(node, target, { onFinish: returned });
  vi.advanceTimersByTime(600);
  expect(returned).toHaveBeenCalledOnce();
  expect(node.style.opacity).toBe("");
  const arrived = vi.fn();
  playFlip(node, target, { onFinish: arrived });
  vi.advanceTimersByTime(600);
  expect(arrived).toHaveBeenCalledOnce();
  expect(node.style.opacity).toBe("");
  expect(node.style.getPropertyValue("--flip-x")).toBe("");
  node.remove();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
