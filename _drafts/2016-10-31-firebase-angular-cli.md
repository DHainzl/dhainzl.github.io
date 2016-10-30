---
layout: post
title: Building a firebase app with Angular 2, the Angular CLI and angularfire2
date:   2015-10-31 04:00:00
categories: development
icon: development
menuId: blog
---

I was just visiting the awesome [ng-europe](https://ngeurope.org/), hearing lots of interesting talks about different tools and workflows.
I decided to try some of the technologies out directly, so here I try to document how to build an app with [Angular 2](https://angular.io/), the [Angular CLI](https://github.com/angular/angular-cli) and Googles [Firebase](https://firebase.google.com/).

To use the firebase APIs with Angular and Typescript, we will use the [angularfire2](https://github.com/angular/angularfire2) library.

Be aware that this post will most likely be updated next week as soon as the videos of the conference are uploaded (most likely on Oct. 31) with the relevant links!

## The goal

What we are going to build here is a small todo app which lets you login via Github or Google and store some todo items specific to your user account. I'll try to keep it pretty simple, and as simple is cool we'll be calling this app `cool-todo`.

## Installing all the global dependencies

First we need to install some npm scripts globally on our machine. I assume that you have `node` and `npm` already installed on your machine (Currently, with version v.1.0.0-beta.18 the CLI needs at least node v4 and npm v3 or higher). Note that you might need to prepend `sudo` to this command if you get a `Permission denied` error.

Also we are making sure that we have `typescript` and `typings` installed.

{% highlight bash %}
$ npm install -g angular-cli firebase-tools typescript typings
{% endhighlight %}

The `angular-cli` install a programm with the name `ng` on the machine. We use it to scaffold the whole application together (both initially and aterwards).

`firebase-tools`, on the other hand, installs a programm `firebase` on our machine. We use this later on to deploy our app to the cloud.

## Registering a firebase app

While npm is installing the dependencies and scripts, we can already go ahead and register the app at the firebase website. Head to the [firebase console](https://console.firebase.google.com/), log in (if you're not already) and create a new project. On the landing page, you can already click the link "Add firebase to your web app" to load all the keys, we need those in a moment.

Now, installing of the global dependencies should be done, and we can go ahead building our great app!

## Starting it all up

Now we are ready to go! Run:

{% highlight bash %}
$ ng new cool-todo
{% endhighlight %}

To create a project in a folder with the name `cool-todo`. Downloading and installing the initial takes a minute or two, so go ahead and grab a cup of coffee (or tea) while this is installing - I'll wait meanwhile for you.

Okay great, are you back? Hopefully the initialisation is done now. Switch into the newly created project folder and install the following additional dependencies:

{% highlight bash %}
$ cd cool-todo
$ npm install --save firebase angularfire2
{% endhighlight %}

I've also needed to manually install the following dependency, this might change in future versions of `angularfire2` (It's still in beta, after all). Watch for an `UNMET PEER DEPENDENCY @types/request@0.0.30` in the output of the commands above, if you get this warning run additionally:

{% highlight bash %}
$ npm install --save @types/request@0.0.30
{% endhighlight %}

Now we are ready to start coding! Open up your favorite code editor and let's do something.

## Initial setup for angularfire2

*You can also find infos about the installation in the official documentation [here](https://github.com/angular/angularfire2/blob/master/docs/1-install-and-setup.md).*

To use firebase, we'll first need to tell our app who it should authenticate with the firebase servers. To do so, we will use the `environment`-feature provided by the Angular CLI. So go ahead and open up the `src/environments/environment.ts` file. This should currently look like this (I've ommited the big comment at the top):

{% highlight typescript %}
export const environment = {
  production: false
};
{% endhighlight %}

Now we just add another key with our firebase config:

{% highlight typescript %}
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "FIREBASE_API_KEY",
    authDomain: "FIREBASE_AUTH_DOMAIN",
    databaseURL: "FIREBASE_DB_URL",
    storageBucket: "FIREBASE_STORAGE_URL"
  }
};
{% endhighlight %}

You can copy / paste these values from the "Add firebase to your web app" popup we've opened before on the firebase website.

Now, open up the `environment.prod.ts` file in the same folder and copy and paste your firebase config in. This allows us to have separate apps for dev and production (e.g. with different payment models and to not change the production statistics while developing), even though we are not using this feature in this demo it is good to already have it ready if we want to do this later on.

Now we need to initialize firebase itself; To do so, open up `arc/app/app.module.ts`. Now add the following imports at the top of the file:

{% highlight typescript %}
import { AngularFireModule } from 'angularfire2';

import { environment } from '../environments/environment';
{% endhighlight %}

and in the module declarator, add the following initializer in the `imports` section:

{% highlight typescript %}
  imports: [
    /* ... */
    AngularFireModule.initializeApp(environment.firebaseConfig)
  ],
{% endhighlight %}

Now we are ready to log in our first users! But how do we do this? Head to the next section ...

## Adding a user login

To add user authentication to our app, we first need to configure firebase which providers we want to use and set those up with the corresponding API connection data. Open up the firebase console in your browser and click on "Authentication" and in the submenu on top choose "Sign-In method" ([Direct Link](https://console.firebase.google.com/project/cool-todo/authentication/providers)). On this page you can activate all supported OAuth providers. For the purpose of this demo, we will activate `Google` and `Github`. As firebase belongs to Google, enabling it is the easiest - you just need to click on the settings of the Google row and enable the switch.

To enable Github, first activate Github on the Firebase page. You'll now need to paste in your Github Client ID and secret and you'll get an "authorization callback URL". Copy this URL and then head to the [Github Developers Page](https://github.com/settings/developers) and create a new OAuth application. Be sure to paste the callback URL from firebase in the "Authorization callback URL" field here.

Finish registering the application, and now you will be presented with a client ID and a user token. Copy those values in the corresponding fields on the firebase page and hit "save" to finish setting up the connection.

Now actually using this is pretty easy. Open up the `src/app/app.component.ts` file and replace its contents with the following:

{% highlight typescript %}
{% raw %}
import { Component } from '@angular/core';

import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2';
import 'firebase';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="!auth">
      <button (click)="loginGithub()">Login with Github</button>
      <button (click)="loginGoogle()">Login with Google</button>
    </div>
    <div *ngIf="auth">
      <span>Welcome, {{ auth.displayName }} ({{auth.email}})</span>
      <button (click)="logout()">Logout</button>
    </div>
  `,
  styleUrls: ['app.component.css']
})
export class AppComponent {
  private uid: string;
  private auth: firebase.User | undefined;

  constructor(
    private af: AngularFire
  ) { }
  
  ngOnInit() {
    this.af.auth.subscribe(
      data => { this.auth = data && data.auth || undefined },
      error => console.error('Could not login ', error)
    )
  }
 
  loginGithub () {
    this.af.auth.login ({
      provider: AuthProviders.Github,
      method: AuthMethods.Popup
    });
  }

  loginGoogle () {
    this.af.auth.login ({
      provider: AuthProviders.Google,
      method: AuthMethods.Popup
    });
  }

  logout() {
    this.af.auth.logout();
  }
}
{% endraw %}
{% endhighlight %}

What this does is essentially:

* Getting the Reference to the `angularfire2`-service in the constructor
* Subscribing to all Auth changes in the `ngOnInit` method and setting the `this.auth` field accordingly
* Logging into Github and Google using the `angularfire2`-service
* And when clicking logout, it logs out the user.

What happens in the template is also pretty easy: We are checking if we have an `auth` set. If we do not, we are displaying the options for the user to login; If we do not, we are welcoming him to our app and allow him to logout again.

Now we can try this out: Go into your console and run

{% highlight bash %}
$ ng serve
{% endhighlight %}

This will start a local development server with live-reload capabilities at [`http://localhost:4200`](http://localhost:4200). You can now visit this URL and you should already be able to successfully log in!

If it doesn't work yet and you get errors in the development console, be sure to follow the "Troubleshooting" steps on the website [here](https://github.com/angular/angularfire2/blob/master/docs/1-install-and-setup.md#user-content-troubleshooting).

## Adding the Todo-list

Now that we have a usertoken, we can start 