// theme/theme.ts
import { Theme } from "@react-navigation/native";

export const themes = {
  light: {
    /* Implement different sub categories like layout, logos, typography etc. */
    layout: {
      background: "#ffffff",
      card: "#f2f2f2",
      text: "#000000",
      subText: "#888888",
      border: "#cccccc",
      buttonBg: "#eeeeee",
      accent: "rgba(0, 128, 255, 1)",
      inputBg: "#f2f2f2",
      placeholder: "#999999",
      infoBg: "#e0e0e0",
    },
    ui: {
  bgDark: "hsla(0, 0%, 90%, 1.00)",            // from hsl(0 0% 90%)
  bg: "hsla(300, 0%, 95%, 1.00)",              // from hsl(300 0% 95%)
  bgLight: "hsla(300, 50%, 100%, 1.00)",       // from hsl(300 50% 100%)
  text: "hsla(300, 0%, 4%, 1.00)",             // from hsl(300 0% 4%)
  textMuted: "hsla(0, 0%, 50%, 1.00)",         // from hsl(0 0% 28%)
  highlight: "hsla(300, 50%, 100%, 1.00)",     // from hsl(300 50% 100%)
  border: "hsla(0, 0%, 50%, 1.00)",            // replaced NaN with 0 deg (gray)
  borderMuted: "hsla(340, 0%, 62%, 1.00)",     // from hsl(340 0% 62%)
  primary: "hsla(357, 44%, 32%, 1.00)",        // from hsl(357 44% 32%)
  secondary: "hsla(183, 100%, 9%, 1.00)",      // from hsl(183 100% 9%)
  danger: "hsla(9, 21%, 41%, 1.00)",           // from hsl(9 21% 41%)
  warning: "hsla(52, 23%, 34%, 1.00)",         // from hsl(52 23% 34%)
  success: "hsla(147, 19%, 36%, 1.00)",        // from hsl(147 19% 36%)
  info: "hsla(217, 22%, 41%, 1.00)",           // from hsl(217 22% 41%)
    },
    nav: {
      dark: false,
      colors: {
        background: "#ffffff",
        card: "#f8f8f8",
        text: "#000000",
        border: "#d0d0d0",
        notification: "#1e90ff",
        primary: "#1e90ff",
      },
    } as Theme,
  },

  dark: {
    layout: {
      primary: "hsla(0, 0%, 0%, 1.00)",
      secondary: "hsla(0, 0%, 5%, 1.00)",
      tertiary: "hsla(0, 0%, 10%, 1.00)",
      text: "hsla(0, 0%, 95%, 1.00)",
      subText: "hsla(0, 0%, 70%, 1.00)",
      border: "hsla(0, 0%, 20%, 1.00)",
      primaryAccent: "rgba(0, 128, 255, 1)",
      secondaryAccent: "rgba(0, 128, 255, 0.5)",
      danger: "hsla(0, 100%, 50%, 1.00)",
      warning: "hsla(39, 100%, 50%, 1.00)",
      success: "hsla(120, 100%, 50%, 1.00)",
      info: "hsla(195, 100%, 50%, 1.00)",
    },
    ui: {
      bgDark: "hsla(228, 79%, 2%, 1.00)",
      bg: "hsla(222, 55%, 7%, 1.00)",
      bgLight: "hsla(220, 35%, 10%, 1.00)",
      text: "hsla(220, 100%, 98%, 1.00)",
      textMuted: "hsla(220, 35%, 73%, 1.00)",
      highlight: "hsla(220, 20%, 42%, 1.00)",
      border: "hsla(220, 26%, 31%, 1.00)",
      borderMuted: "hsla(220, 37%, 20%, 1.00)",
      primary: "rgba(220, 78, 76, 1)",
      secondary1: "hsla(210, 100%, 50%, 0.50)",
      danger: "hsla(9, 26%, 64%, 1.00)",
      warning: "hsla(52, 19%, 57%, 1.00)",
      success: "hsla(146, 17%, 59%, 1.00)",
      info: "hsla(217, 28%, 65%, 1.00)",
    },
    nav: {
      dark: true,
      colors: {
        background: "#000000",
        card: "#121212",
        text: "#ffffff",
        border: "#333333",
        notification: "#ff4500",
        primary: "#ff4500",
      },
    } as Theme,
  },

  pastel: {
    layout: {
      background: "#c4bfb1ff",
      card: "#fff3ec",
      text: "#001858",
      subText: "#5f6c7b",
      border: "#ffd7ba",
      buttonBg: "#ffeedd",
      accent: "#f582ae",
      inputBg: "#fff3ec",
      placeholder: "#9a8c98",
      infoBg: "#f2e9e4",
    },
    ui: {
      bgDark: "hsla(30, 50%, 89%, 1.00)",
      bg: "hsla(35, 100%, 99%, 1.00)",
      bgLight: "hsla(0, 0%, 100%, 1.00)",
      text: "hsla(25, 38%, 13%, 1.00)", // High contrast brown
      textMuted: "hsla(30, 29%, 41%, 1.00)", // Medium brown
      highlight: "hsla(30, 100%, 92%, 1.00)",
      border: "hsla(30, 43%, 84%, 1.00)",
      borderMuted: "hsla(30, 37%, 91%, 1.00)",
      primary: "hsla(336, 84%, 57%, 1.00)", // Pink primary
      secondary: "hsla(271, 76%, 53%, 1.00)", // Purple secondary
      danger: "hsla(354, 70%, 54%, 1.00)",
      warning: "hsla(25, 95%, 53%, 1.00)",
      success: "hsla(162, 73%, 46%, 1.00)", // Teal success
      info: "hsla(188, 86%, 53%, 1.00)",
    },
    nav: {
      dark: false,
      colors: {
        background: "#fef6e4",
        card: "#fff3ec",
        text: "#001858",
        border: "#ffd7ba",
        notification: "#f582ae",
        primary: "#f582ae",
      },
    } as Theme,
  },

  pink: {
    layout: {
      background: "#B33791",
      card: "#101010",
      text: "#ffffff",
      subText: "#aaaaaa",
      border: "#222222",
      buttonBg: "#111111",
      accent: "rgba(0, 128, 255, 1)",
      inputBg: "#121212",
      placeholder: "#666666",
      infoBg: "#101010",
    },
    ui: {
      bgDark: "hsla(0, 0%, 4%, 1.00)",
      bg: "hsla(0, 0%, 10%, 1.00)",
      bgLight: "hsla(0, 0%, 15%, 1.00)",
      text: "hsla(0, 0%, 100%, 1.00)", // High contrast
      textMuted: "hsla(0, 0%, 72%, 1.00)", // Good contrast
      highlight: "hsla(340, 45%, 20%, 1.00)", // Pink highlight
      border: "hsla(320, 45%, 30%, 1.00)", // Pink border
      borderMuted: "hsla(0, 0%, 20%, 1.00)",
      primary: "hsla(328, 100%, 54%, 1.00)", // Deep pink
      secondary: "hsla(322, 88%, 41%, 1.00)", // Medium violet red
      danger: "hsla(351, 100%, 65%, 1.00)",
      warning: "hsla(36, 77%, 57%, 1.00)",
      success: "hsla(120, 38%, 69%, 1.00)",
      info: "hsla(207, 90%, 61%, 1.00)",
    },
    nav: {
      dark: true,
      colors: {
        background: "#000000",
        card: "#121212",
        text: "#ffffff",
        border: "#333333",
        notification: "#ff4500",
        primary: "#ff4500",
      },
    } as Theme,
  },

  blue: {
    layout: {
      background: "#fcfcfc",
      card: "#0059ffff",
      text: "#ffffff",
      subText: "#aaaaaa",
      border: "#222222",
      buttonBg: "#111111",
      accent: "rgba(0, 128, 255, 1)",
      inputBg: "#121212",
      placeholder: "#666666",
      infoBg: "#101010",
    },
    ui: {
      bgDark: "hsla(197, 100%, 94%, 1.00)",
      bg: "hsla(208, 100%, 97%, 1.00)",
      bgLight: "hsla(0, 0%, 100%, 1.00)",
      text: "hsla(219, 64%, 27%, 1.00)", // High contrast blue
      textMuted: "hsla(215, 20%, 35%, 1.00)", // Slate
      highlight: "hsla(214, 100%, 92%, 1.00)",
      border: "hsla(213, 100%, 88%, 1.00)",
      borderMuted: "hsla(197, 100%, 94%, 1.00)",
      primary: "hsla(217, 91%, 60%, 1.00)", // Blue primary
      secondary: "hsla(199, 89%, 48%, 1.00)", // Sky blue
      danger: "hsla(0, 84%, 60%, 1.00)",
      warning: "hsla(38, 92%, 50%, 1.00)",
      success: "hsla(158, 64%, 52%, 1.00)",
      info: "hsla(188, 94%, 43%, 1.00)",
    },
    nav: {
      dark: true,
      colors: {
        background: "#000000",
        card: "#121212",
        text: "#ffffff",
        border: "#333333",
        notification: "#ff4500",
        primary: "#ff4500",
      },
    } as Theme,
  },

  modern: {
    layout: {
      background: "#050505",
      card: "#101010",
      text: "#ffffff",
      subText: "#aaaaaa",
      border: "#222222",
      buttonBg: "#111111",
      accent: "rgba(0, 128, 255, 1)",
      inputBg: "#121212",
      placeholder: "#666666",
      infoBg: "#101010",
    },
    ui: {
      bgDark: "hsla(0, 0%, 4%, 1.00)",
      bg: "hsla(0, 0%, 6%, 1.00)",
      bgLight: "hsla(0, 0%, 11%, 1.00)",
      text: "hsla(0, 0%, 98%, 1.00)", // High contrast
      textMuted: "hsla(0, 0%, 64%, 1.00)", // Good contrast
      highlight: "hsla(218, 91%, 68%, 0.15)", // Blue highlight
      border: "hsla(0, 0%, 25%, 1.00)",
      borderMuted: "hsla(0, 0%, 15%, 1.00)",
      primary: "hsla(187, 100%, 50%, 1.00)", // Cyan primary
      secondary: "hsla(258, 90%, 66%, 1.00)", // Purple secondary
      danger: "hsla(0, 73%, 69%, 1.00)",
      warning: "hsla(45, 93%, 58%, 1.00)",
      success: "hsla(152, 69%, 61%, 1.00)",
      info: "hsla(213, 94%, 68%, 1.00)",
    },
    nav: {
      dark: true,
      colors: {
        background: "#000000",
        card: "#121212",
        text: "#ffffff",
        border: "#333333",
        notification: "#ff4500",
        primary: "#ff4500",
      },
    } as Theme,
  },
};

export type ThemeKey = keyof typeof themes;
export type UITheme = typeof themes[ThemeKey]['ui'];