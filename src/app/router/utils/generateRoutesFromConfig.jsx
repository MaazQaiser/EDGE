import { Redirect, Route, Switch } from 'react-router-dom';

import Page from '../middleware/Page';

export default function generateRoutesFromConfig(config) {
  return (
    <Switch>
      {config.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          exact={route.exact}
          render={() => {
            if (route.redirect) {
              return <Redirect to={route.redirect} />;
            }

            return <Page route={route} />;
          }}
        />
      ))}
    </Switch>
  );
}
