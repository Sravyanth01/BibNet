//import logo from "./logo.svg";
//import "./App.css";
import React from 'react';
import { Routes, Route } from "react-router-dom";
import "./NewStyle.css";
import Header from "./components/Header";
import Home from "./components/Home";
import About from "./components/About";
import Overview from "./components/Overview";
import Sources from "./components/Sources";
import Document from "./components/Document";
import CitedReferences from "./components/CitedReferences";
import MostRelevantAuthors from './components/MostRelevantAuthors';
import MostRelevantAffiliation from './components/MostRelevantAffiliation';
import AffiliationProductionOverTime from './components/AffiliationProductionOverTime';
import AverageCitationsPerYear from './components/AverageCitationsPerYear';
import MainInformation from './components/MainInformation';
import Documents from './components/Documents';
import Author from './components/Author';
import WordCloud from './components/WordCloud';
import TrendTopics from './components/TrendTopics';  
import Language from './components/Language';
import Journals from './components/Journals';
import PublisherAnalysis from './components/PublisherAnalysis';
import PublisherAnalysis2 from './components/PublisherAnalysis2';
import OpenAccess from './components/OpenAccess';
import Journal from './components/Journal';
import AuthorCount from './components/AuthorCount';
import TeamSizeOverview from './components/TeamSizeOverview';
import CountryCount from './components/CountryCount'; 


function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/about" element={<About/>}></Route>
        <Route path="/Overview" element={<Overview/>}></Route>
        <Route path="/sources" element={<Sources/>}> </Route>
        <Route path="/document" element={<Document/>}> </Route>
        <Route path="/cited-references" element={<CitedReferences/>}> </Route>
        <Route path="/most-relevant-authors" element={<MostRelevantAuthors />} />
        <Route path="/most-relevant-affiliation" element={<MostRelevantAffiliation />} />
        <Route path="/affiliation-production-over-time" element={<AffiliationProductionOverTime />} />
        <Route path="/avg-citations-per-year" element={<AverageCitationsPerYear />} />
        <Route path="/publisher-count" element={<MainInformation />} />
        {/* <Route path="/documents" element={<Documents />} /> */}
        <Route path="/author" element={<Author />} />
        <Route path="/word-cloud" element={<WordCloud />} />  
        <Route path="/trend-topics" element={<TrendTopics />} />
        <Route path='/journals-trend' element={<Journals/>} />
        <Route path='/language' element={<Language/>} />
        <Route path='/document-type' element={<Documents/>} />
        <Route path='/yearwise-trend' element={<PublisherAnalysis/>} />
        <Route path='/decadewise-trend' element={<PublisherAnalysis2/>} />
        <Route path='/open-access' element={<OpenAccess/>}/>
        <Route path='/journal-count' element={<Journal/>}/>
        <Route path='/authors-count' element={<AuthorCount/>}/>
        <Route path='/team-size' element={<TeamSizeOverview/>}/>
        <Route path='/country-count' element={<CountryCount/>}/>
        <Route path='/structure' element={<WordCloud/>}/>





      </Routes>
    </div>
  );
}

export default App;
