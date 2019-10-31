import React, { useState } from "react";
import { IAction } from "../functions";

import "./action-viewer.css";

interface Props {
  action: IAction;
}

export default function ActionViewer(props: Props) {
  const { action } = props;
  const [open, setOpen] = useState();

  return (
    <div className="action-viewer">
      {!open && (
        <div onClick={() => setOpen(true)}>
          <h1>{action.type}</h1>
        </div>
      )}
      {open && (
        <div>
          <h1 onClick={() => setOpen(false)}>{action.type}</h1>
          <p>data: {JSON.stringify(action.payload)}</p>
          <p>ID: {action.id}</p>
        </div>
      )}
    </div>
  );
}
