module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:form-standards/recommended"
  ],
  plugins: [
    "form-standards"
  ],
  rules: {
    // Customize rule severity if needed
    "form-standards/use-form-base": "warn",
    "form-standards/use-validation-library": "warn",
    "form-standards/use-form-field-components": "warn",
    
    // Other project-specific rules
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off"
  },
  settings: {
    // Ensure the plugin can resolve imports correctly
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  }
}; 