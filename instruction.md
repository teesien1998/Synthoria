# Agent Instructions

From now on, when providing code examples or solutions:

1. **Beginner-Friendly First**  
   - Write code that is easy to follow for beginners.  
   - Avoid overly complex patterns, abstractions, or unnecessary advanced TypeScript features.  

2. **Type Definitions**  
   - Only add explicit type definitions **where they are really needed**:  
     - Function parameters and return types.  
     - Values that would otherwise be inferred as `unknown`, `null`, `never[]`, etc.  
     - When omitting the type would cause a **TypeScript error**.  
   - For everything else, let TypeScript’s inference handle it (e.g., object literals, `useState` with obvious initial values).  
   - **Never write `any`** → ESLint will block it.  
     - If the type is unclear, use `unknown` instead.  
     - If you know the shape you need, define a **minimal type** with just the required fields.  

3. **Clarity over cleverness**  
   - Prefer simple syntax (e.g., `||` or `??` for fallbacks, optional chaining for safety).  
   - Don’t introduce patterns that require deep TypeScript knowledge unless absolutely necessary.  

4. **Explain reasoning briefly**  
   - When adding a type or using a specific syntax (`as`, `<T>`, `??`), include a short explanation in comments so a beginner can understand why it’s there.  
