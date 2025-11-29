import DefaultTheme from "vitepress/theme-without-fonts";

import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import '@shikijs/vitepress-twoslash/style.css'
import './styles/vars.css'
import './styles/landing.css'

// Import Tailwind entry for the theme. Replace or remove `custom.css` styles as you migrate.
import "./styles/tailwind.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(TwoslashFloatingVue)
    // ...
  }
} satisfies Theme
