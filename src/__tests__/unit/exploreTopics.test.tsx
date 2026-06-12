import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react"; // ← within added here
import userEvent from "@testing-library/user-event";
import { ExploreTopics } from "@/components/discovery/exploreTopics";

const createContext = (overrides: any = {}) => ({
  followedTags: [] as string[],
  activeTag: "",
  setActiveTag: vi.fn(),
  handleTagToggle: vi.fn(),
  isTagMutationPending: false,
  isProfileComplete: true,
  ...overrides,
});

describe("ExploreTopics", () => {
  it("renders every predefined topic as a listitem", () => {
    render(<ExploreTopics context={createContext()} />);

    const list = screen.getByRole("list", { name: /Available topics/ });
    const items = within(list).getAllByRole("listitem");

    expect(items.length).toBe(8); // PREDEFINED_TAGS has 8 entries
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Personal Growth")).toBeInTheDocument();
  });

  it("activates a filter tag on click and removes it when clicked again", async () => {
    const user = userEvent.setup();
    const setActiveTag = vi.fn();

    const { rerender } = render(
      <ExploreTopics context={createContext({ setActiveTag })} />,
    );

    // Activate — button aria-label is "Filter feed by Programming"
    await user.click(
      screen.getByRole("button", { name: /Filter feed by Programming/ }),
    );
    expect(setActiveTag).toHaveBeenCalledWith("Programming");

    // Re-render with activeTag set to simulate controlled state update
    rerender(
      <ExploreTopics
        context={createContext({ activeTag: "Programming", setActiveTag })}
      />,
    );

    // Now aria-label flips to "Remove filter: Programming"
    const activeBtn = screen.getByRole("button", {
      name: /Remove filter: Programming/,
    });
    expect(activeBtn).toHaveAttribute("aria-pressed", "true");
    expect(activeBtn).toHaveClass("bg-brand-primary");

    await user.click(activeBtn);
    expect(setActiveTag).toHaveBeenLastCalledWith("");
  });

  it("calls handleTagToggle when Follow button is clicked", async () => {
    const user = userEvent.setup();
    const handleTagToggle = vi.fn();

    render(<ExploreTopics context={createContext({ handleTagToggle })} />);

    await user.click(
      screen.getByRole("button", { name: /Follow Technology/ }),
    );
    expect(handleTagToggle).toHaveBeenCalledExactlyOnceWith("Technology");
  });

  it("displays Following for followed tags and + Follow for unfollowed tags", () => {
    render(
      <ExploreTopics
        context={createContext({ followedTags: ["Design", "Writing"] })}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Unfollow Design/ }),
    ).toHaveTextContent("Following");

    expect(
      screen.getByRole("button", { name: /Follow Technology/ }),
    ).toHaveTextContent("+ Follow");
  });

  it("disables Follow button and shows tooltip reason when profile is incomplete", () => {
    render(
      <ExploreTopics
        context={createContext({ isProfileComplete: false })}
      />,
    );

    const btn = screen.getByRole("button", {
      name: /Complete your profile to follow Technology/,
    });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute(
      "title",
      "Complete your profile to follow topics",
    );
  });

  it("disables Follow button while a tag mutation is pending", () => {
    render(
      <ExploreTopics
        context={createContext({ isTagMutationPending: true })}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Follow Technology/ }),
    ).toBeDisabled();
  });

  it("applies distinct visual treatment to the active filter tag", () => {
    render(
      <ExploreTopics
        context={createContext({ activeTag: "Entrepreneurship" })}
      />,
    );

    const active = screen.getByRole("button", {
      name: /Remove filter: Entrepreneurship/,
    });
    expect(active).toHaveClass("bg-brand-primary");
    expect(active).toHaveClass("text-white");

    const inactive = screen.getByRole("button", {
      name: /Filter feed by Productivity/,
    });
    expect(inactive).toHaveClass("text-slate-700");
  });
});