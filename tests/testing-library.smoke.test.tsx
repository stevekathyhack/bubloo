import { render, screen } from "@testing-library/react";

function CalmButton() {
  return <button type="button">Today, this is enough.</button>;
}

describe("testing-library setup", () => {
  it("renders a component in jsdom with jest-dom matchers", () => {
    render(<CalmButton />);

    expect(screen.getByRole("button", { name: "Today, this is enough." })).toBeInTheDocument();
  });
});
