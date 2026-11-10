export default function FormField({ label, htmlFor, hint, children, required = false }) {
  return <label className="form-field" htmlFor={htmlFor}><span>{label}{required && <em> *</em>}</span>{children}{hint && <small className="form-hint">{hint}</small>}</label>
}
