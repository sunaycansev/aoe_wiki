import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MainLayout } from "./MainLayout";

vi.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet-mock">Outlet Content</div>,
}));

vi.mock("../components/Navigation", () => ({
  Navigation: () => <nav data-testid="navigation-mock">Navigation Mock</nav>,
}));

describe("MainLayout Component", () => {
  it("renders the layout structure correctly", () => {
    render(<MainLayout />);

    const layoutContainer = document.querySelector(
      "[class*='layoutContainer']",
    );
    expect(layoutContainer).toBeInTheDocument();

    const header = document.querySelector("[class*='header']");
    expect(header).toBeInTheDocument();

    const navigation = screen.getByTestId("navigation-mock");
    expect(navigation).toBeInTheDocument();
    expect(header).toContainElement(navigation);

    const mainContent = document.querySelector("[class*='mainContent']");
    expect(mainContent).toBeInTheDocument();

    const outlet = screen.getByTestId("outlet-mock");
    expect(outlet).toBeInTheDocument();
    expect(mainContent).toContainElement(outlet);
  });
});
