# How to use

Create a config json file in the config directory. Populate the appropriate fields.

### Naming convention

Name the config file according to the payment period. Name should have the following format:

`month_year.json`

Note as the email gets sent in slovak language, the month can be in slovak. It just has to be consistent.

### Example steps

Lets take the period of `october 2018` as an example.

1. copy the default config (or other existing period) file:

    `cp config/default.json config/oktober_2018.json`

2. edit the fields using your favorite editor (e.g. vim):

    `vim config/oktober_2018.json`

3. Create a history folder (if not existing already):

    `mkdir -p history`

4. run the script setting `NODE_ENV` to `oktober_2018` and save its output to history as well:

    `NODE_ENV=oktober_2018 node index.js | tee -a history/oktober_2018.txt`

5. Work on world peace & be happy!
