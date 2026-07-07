// This file tells TypeScript that CSS files are modules
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}