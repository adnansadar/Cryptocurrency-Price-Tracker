# Cryptocurrency Price Tracker

This Web App has been deployed at [this link](https://my-cryptotracker.netlify.app/).

## Screenshots
![Screenshot from 2021-06-02 11-24-55](https://user-images.githubusercontent.com/45177064/120499908-0fca3c00-c3de-11eb-8e28-a07f0a7d7bc6.png)

![Screenshot from 2021-06-02 20-12-47](https://user-images.githubusercontent.com/45177064/120501165-068d9f00-c3df-11eb-9795-8b110a26bd94.png)

![Screenshot from 2021-06-02 20-10-14](https://user-images.githubusercontent.com/45177064/120500860-c8907b00-c3de-11eb-8ad2-7a713820f0da.png)

![Screenshot from 2021-06-02 20-18-44](https://user-images.githubusercontent.com/45177064/120502164-d1ce1780-c3df-11eb-8bff-66406df3a055.png)










## About the Project

This single page application has been designed using ReactJS for a smooth and fast UI. Functional Components along with React Hooks have been made use of for state management, useEffect() has been used to fetch cryptocurrency data on initial mount of the component. useState() is used to store the coins data in an array and the search input entered by the user as a string. Event handlers have been used to update the App.js component's state.
Object Destructuring has been used to pass the coin data as props to Coin.js component. This is the component which will render all the Cryptocurrency data initially and later on showing only necessary results as the user searches.
Array filter and map functions have been made use of to get matching results as user enter words in the search box.

**New Features:** 
- Dark Mode Switch Functionality
- Integrated bootstrap with the current project to make it responsive with all devices and also made use of linear gradient CSS property to get a better UI look with a combination of 3 colors.
- Contact Page has been added to get in touch via email. [EmailJS has been used for providing the email service, Formik2 has been used for form validation]
- User can enter the amount(any preferred currency) he/she wants to invest in the respective cryptocurrency, the equivalent crypto coins that can be bought with that amount will be displayed. 

**Upcoming Features:**
- Add to Portfolio (Allows user to keep track of their crypto investments)

_This is an ongoing project, feel free to contribute and open pull requests. I would love to know your inputs!_

## Available Scripts

### `npm install`

Installs all the dependencies of the project.
If you don't have yarn installed, you can run the command `npm install --global yarn`. To download NodeJS on your system if you already don't have it installed, you can download it from [here](https://nodejs.org/en/).

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### Acknowledgements

[Youtube Video](https://www.youtube.com/watch?v=9ohK7CapmIs) By Brian Design
