# NuntiusSAC
> Node JS application to schedulle and send e-mail with SAP Analytics Cloud (SAC) stories content.

This application is designed for those who need to schedulle an email message that contains SAP Analytics Cloud Story content. Here's what's the application do: 

- Login in your SAC account
- Go to your Story's page
- Download the Story's pdf
- Split the pdf into png images
- Send an email with those images (on the body or attached)

## Prereqs

These are the prereqs for the application run correctly:

- mongodb
- imagemagick
- ghostscript
- poppler-utils


## Installation

OS X & Linux:

```sh
git clone <https://github.com/elvisjhonataoliveira/NuntiusSAC>
cd NuntiusSAC
npm install
```

## Before start
Before you start the application you should change all the properties that is need for the app run correctly. For this you should edit the file "config/properties.conf" and change/set all properties needed.

## First Access
In your first access you'll see the login page. The user/password combination is: admin/admin
After you login for the first time, create a new user (the password will be sent through an email message)

## Meta

Distributed under the MIT license. See ``LICENSE`` for more information.

## Contributing

1. Fork it
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
