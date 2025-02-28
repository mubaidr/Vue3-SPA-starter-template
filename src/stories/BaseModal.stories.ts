import type { Meta, StoryObj } from "@storybook/vue3";

import BaseModal from "@/components/modals/BaseModal.vue";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof BaseModal> = {
  title: "Components/BaseModal",
  component: BaseModal,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  args: {
    title: "Hello World",
    triggerText: "Hello World",
    default: "Hello World",
  }, // default value
};

export default meta;
type Story = StoryObj<typeof BaseModal>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {};

export const MinimumExample: Story = {
  args: {
    triggerText: undefined,
    default: null,
  },
};

/**
 * This story will show the modal with the background click to close feature disabled, and no clickable close options. You could still escape using the "escape" key
 */
export const LockedIn: Story = {
  args: {
    allowBackgroundClickToClose: false,
    showFooter: false,
    showCloseInHeader: false,
  },
};

export const WithoutFooter: Story = {
  args: {
    showFooter: false,
  },
};
