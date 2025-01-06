import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MouseEvent } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Options = {
  // eslint-disable-next-line no-unused-vars
  callback?: ((...args: never[]) => unknown) | null;
  noPreventDefault?: boolean;
};

export const preventBubbling = (
  event: MouseEvent<HTMLElement>,
  options?: Options
) => {
  if (options?.noPreventDefault !== true) event.preventDefault();

  event.stopPropagation();

  // Perform any additional logic based on the options/callback if needed.
  if (options?.callback) options.callback();
};
