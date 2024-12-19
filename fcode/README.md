Steps I have used to create this navigation.

### Step1. React Router Dom installation

npm install react-router-dom@latest

### Step2.verify the package.json is updated with react-router-dom in dependency

### start the server

npm start

### Step3. Import BrowserRouter

open index.js and import BrowserRouter from react-router-dom
and wrap the <app> with <BrowserRouter></BrowserRouter>
it will appear like
<BrowserRouter>
<App />
</BrowserRouter>

### Step4. Add few sample page

I have created Home.js, Page1.js, Page2.js and Page3.js for the respective page with react arrow function using racfe short key in components folder in src folder

### Step5. Modify app.js

import Routes and Route in app.js file
removed the readymade code placed in return and added <Routes></Routes>
add <Route></Route> for different pages like home page , page1, page2 and page3
set path='/' for main page
and path = 'pagename' for other pages
you can add as many pages as you can and set its route in app.js same as mentioned above.
you should add element={} for respective Route so that it can get the value of respective page
make sure the components are imported on the top of app.js
for ex: for home page the routes will look like

import Home from './components/Home'
...
<Route path='/' element={<Home />}></Route>
...

### Step6. create navigation bar

Create a Navigator component as Navigator.js
set the navigation html code within Nav tag
and replace a tag with NavLink tag
import {Navlink} from 'react-router-dom'
you will get the active class property with NavLink hence we have used NavLink instead of Link

import this Navigator component in app.js and
add <Navigator /> just above the <Routes>

-- to be continued --
