// theme.js

// 1. import `extendTheme` function
import { extendTheme } from "@chakra-ui/react";

// 2. Add your color mode config
const config = {
  initialColorMode: "light",
  useSystemColorMode: false
};

// 3. extend the theme
const theme = extendTheme({
  config,
  styles: {
    global: (props) => ({
      "html, body": {
        fontSize: "sm",
        color: props.colorMode === "dark" ? "white" : "gray.600",
        lineHeight: "tall",
        transition: "0.8s linear"
      }
    })
  }
});

export default theme;
