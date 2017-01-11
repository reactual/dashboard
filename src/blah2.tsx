import * as React from 'react';
import {Blah} from './blah';

export class Blah2 extends Blah {
  blah(): string {
    return "blah2";
  }
}

class App1 extends React.Component<null, null> {
  render() {
    return (
      <div>
        <p>Blah</p>
        <p>Blah2</p>
      </div>
    );
  }
}

export default App1;
