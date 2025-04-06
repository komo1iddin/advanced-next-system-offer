/**
 * ESLint plugin to enforce usage of standardized form components and validation patterns
 */

module.exports = {
  rules: {
    // Rule to enforce using FormBase for forms
    "use-form-base": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Enforce using FormBase for form components",
          category: "Best Practices",
          recommended: true,
        },
        fixable: "code",
        schema: [], // no options
      },
      create(context) {
        return {
          // Look for components that might be forms
          JSXElement(node) {
            // Check if this is a form element
            if (node.openingElement.name.name === "form") {
              // Check if it's inside a FormBase component
              let isInsideFormBase = false;
              let parent = node.parent;
              
              while (parent) {
                if (
                  parent.type === "JSXElement" && 
                  parent.openingElement.name.name === "FormBase"
                ) {
                  isInsideFormBase = true;
                  break;
                }
                parent = parent.parent;
              }
              
              if (!isInsideFormBase) {
                context.report({
                  node,
                  message: "Use FormBase from @/app/components/forms instead of raw HTML form elements",
                  fix(fixer) {
                    // This is a simplified fix and may need manual adjustment
                    return fixer.insertTextBefore(
                      node,
                      "{ /* TODO: Replace with FormBase from @/app/components/forms */ }\n"
                    );
                  }
                });
              }
            }
          },
          
          // Check imports to make sure FormBase is imported if forms are used
          ImportDeclaration(node) {
            const formComponentsUsed = context.getSourceCode().text.includes("<form");
            
            if (
              formComponentsUsed &&
              node.source.value.includes("react-hook-form") &&
              !context.getSourceCode().text.includes("import { FormBase")
            ) {
              context.report({
                node,
                message: "When using react-hook-form, prefer FormBase from @/app/components/forms"
              });
            }
          }
        };
      }
    },
    
    // Rule to enforce using the validation library
    "use-validation-library": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Enforce using the validation library for Zod schemas",
          category: "Best Practices",
          recommended: true,
        },
        fixable: "code",
        schema: [], // no options
      },
      create(context) {
        return {
          // Check for raw zod validations that could use our library
          CallExpression(node) {
            // Check if this is a z.string(), z.number(), etc. call
            if (
              node.callee.type === "MemberExpression" &&
              node.callee.object.name === "z"
            ) {
              const method = node.callee.property.name;
              
              // Map of Zod methods to our validation library equivalents
              const validationMap = {
                "string": {
                  methodCheck: (node) => {
                    // Check if it's using min() with 1 for required strings
                    return node.parent && 
                      node.parent.type === "CallExpression" && 
                      node.parent.callee.property.name === "min" &&
                      node.parent.arguments[0].value === 1;
                  },
                  replacement: "validation.requiredString"
                },
                "email": {
                  methodCheck: () => true,
                  replacement: "validation.email"
                },
                "number": {
                  methodCheck: (node) => {
                    // Check if it's using min() and max() for range validation
                    return node.parent && 
                      node.parent.type === "CallExpression" && 
                      ["min", "max"].includes(node.parent.callee.property.name);
                  },
                  replacement: "validation.numberWithRange"
                },
                "date": {
                  methodCheck: () => true,
                  replacement: "validation.requiredDate"
                },
                "url": {
                  methodCheck: () => true,
                  replacement: "validation.url"
                }
              };
              
              if (validationMap[method] && validationMap[method].methodCheck(node)) {
                context.report({
                  node,
                  message: `Use ${validationMap[method].replacement} from the validation library instead of direct Zod methods`,
                  fix(fixer) {
                    // This is a simplified fix and may need manual adjustment
                    return fixer.insertTextBefore(
                      node,
                      `/* TODO: Replace with ${validationMap[method].replacement} */\n`
                    );
                  }
                });
              }
            }
          },
          
          // Check imports to suggest importing validation library
          ImportDeclaration(node) {
            if (
              node.source.value === "zod" &&
              !context.getSourceCode().text.includes("import { validation ")
            ) {
              const zodUsage = context.getSourceCode().text.includes("z.object");
              
              if (zodUsage) {
                context.report({
                  node,
                  message: "When using Zod for validation, import and use validation library from @/app/components/forms",
                  fix(fixer) {
                    return fixer.insertTextAfter(
                      node,
                      "\nimport { validation } from '@/app/components/forms';"
                    );
                  }
                });
              }
            }
          }
        };
      }
    },
    
    // Rule to enforce using standardized field components
    "use-form-field-components": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Enforce using standardized form field components",
          category: "Best Practices",
          recommended: true,
        },
        fixable: "code",
        schema: [], // no options
      },
      create(context) {
        return {
          // Look for FormField components that could use our standardized components
          JSXElement(node) {
            // Check if this is a FormField element
            if (
              node.openingElement.name.name === "FormField" &&
              node.parent &&
              node.parent.type === "JSXElement"
            ) {
              // Extract the properties
              const props = node.openingElement.attributes;
              let fieldName = null;
              let containsInput = false;
              let containsSelect = false;
              let containsSwitch = false;
              
              // Find the field name
              for (const prop of props) {
                if (prop.name && prop.name.name === "name" && prop.value) {
                  fieldName = prop.value.value;
                }
              }
              
              // Look for child components to determine field type
              const jsxChildren = node.children.filter(child => child.type === "JSXElement");
              for (const child of jsxChildren) {
                if (child.openingElement.name.name === "FormItem") {
                  const formItemChildren = child.children.filter(c => c.type === "JSXElement");
                  for (const formItemChild of formItemChildren) {
                    const elementName = formItemChild.openingElement.name.name;
                    if (elementName === "Input") containsInput = true;
                    if (elementName === "Select") containsSelect = true;
                    if (elementName === "Switch") containsSwitch = true;
                  }
                }
              }
              
              if (fieldName && containsInput) {
                context.report({
                  node,
                  message: `Consider using FormTextField for the "${fieldName}" field instead of raw FormField + Input`,
                  fix(fixer) {
                    // This is a simplified suggestion, not a complete fix
                    return fixer.insertTextBefore(
                      node,
                      `{/* TODO: Replace with <FormTextField name="${fieldName}" label="..." /> */}\n`
                    );
                  }
                });
              } else if (fieldName && containsSelect) {
                context.report({
                  node,
                  message: `Consider using FormSelectField for the "${fieldName}" field instead of raw FormField + Select`,
                  fix(fixer) {
                    return fixer.insertTextBefore(
                      node,
                      `{/* TODO: Replace with <FormSelectField name="${fieldName}" label="..." options={[...]} /> */}\n`
                    );
                  }
                });
              } else if (fieldName && containsSwitch) {
                context.report({
                  node,
                  message: `Consider using FormSwitchField for the "${fieldName}" field instead of raw FormField + Switch`,
                  fix(fixer) {
                    return fixer.insertTextBefore(
                      node,
                      `{/* TODO: Replace with <FormSwitchField name="${fieldName}" label="..." /> */}\n`
                    );
                  }
                });
              }
            }
          },
          
          // Check imports to suggest importing field components if form components are used
          ImportDeclaration(node) {
            const usingFormUI = node.source.value.includes("ui/form");
            const usingInput = context.getSourceCode().text.includes("ui/input");
            const usingSelect = context.getSourceCode().text.includes("ui/select");
            const usingSwitch = context.getSourceCode().text.includes("ui/switch");
            
            if (
              (usingFormUI && (usingInput || usingSelect || usingSwitch)) &&
              !context.getSourceCode().text.includes("import { FormTextField") &&
              !context.getSourceCode().text.includes("import { FormSelectField") &&
              !context.getSourceCode().text.includes("import { FormSwitchField")
            ) {
              context.report({
                node,
                message: "Consider using standardized form field components from @/app/components/forms",
                fix(fixer) {
                  return fixer.insertTextAfter(
                    node,
                    "\nimport { FormTextField, FormSelectField, FormSwitchField } from '@/app/components/forms';"
                  );
                }
              });
            }
          }
        };
      }
    }
  },
  
  configs: {
    recommended: {
      plugins: ["form-standards"],
      rules: {
        "form-standards/use-form-base": "warn",
        "form-standards/use-validation-library": "warn",
        "form-standards/use-form-field-components": "warn"
      }
    }
  }
}; 