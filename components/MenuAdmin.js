const classes = require('./../styles/menu.module.css');

export default function MenuAdmin(props) {
  let section = (title, componentName, Component) => {
    return (
      <>
      <br/>
        <h1>{props.title}</h1>
        <br/>
        {/* Render of the Component */}
        {Component}
      </>
    );
  };
  return (
    <div>{section(props.title, props.componentName, props.Component)}</div>
  );
}
