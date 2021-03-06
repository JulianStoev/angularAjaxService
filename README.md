# Angular Ajax Service
A simple Ajax service for use in Angular 9+

## Sample usage
```
this.ajax.post({
  uri: '/login',
  data: {
    username: 'myusername',
    password: 'mypassword'
  },
  callback: (json: any) => {
    // your response here
  }
});
```
