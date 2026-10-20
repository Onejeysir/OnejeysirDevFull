import { useInView } from "../hooks/useInView.js";

export function Reveal({ as: Tag = "div", i = 0, className = "", children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} className={`rv ${inView ? "in" : ""} ${className}`} style={{ "--i": i }} {...rest}>
      {children}
    </Tag>
  );
}
