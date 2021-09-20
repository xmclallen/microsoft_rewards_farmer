# Microsoft Rewards Points Farmer

## Dependencies:

 - Google Chrome. https://www.google.fr/chrome/

## Installation:

1 - Rename the `settings.json.example` file to `settings.json` and provide your Microsoft account information to the `accounts` section. 

This should look like:

    ```json
    "accounts": [{
        "username": "you@domain.com",
        "password": "yourPassword1!"
    }]
    ```

2 - install npm dependencies
```
npm install
```

## Running

This is as simple as running the following command in the folder you have cloned.

```
node autoFarm.js
````

Licensed under WTFPL
