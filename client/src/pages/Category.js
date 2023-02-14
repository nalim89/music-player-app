import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_USERS, QUERY_USER, QUERY_ME } from '../utils/queries';

import Auth from "../utils/auth";

const Category = () => {
    const { id } = useParams();

    const { loading, data, error } = useQuery(
        {
            variables: { id },
        });

    if (Auth.loggedIn() && Auth.getProfile().data._id === id) {
        return <Navigate to="/categories" replace />;
    }

    if (loading) {
        return (
            <div className="container min-vh-100">
                <h4>Loading...</h4>
            </div>
        );
    }

    if (!Auth.loggedIn()) {
        return (
            <div className='container min-vh-100'>
                <div className='row'>
                    <h4 className='col-12 text-center'>
                        You need to be logged in to see this. Use the navigation links above to
                        sign up or log in!
                    </h4>
                </div>
            </div>
        );
    }

    return (
        <div className='container min-vh-100'>
            <div>
                <h2 className='text-center mb-3'>
                    Viewing Category Songs.
                </h2>
                <main>
                    <div className='col-lg-3 col-md-6 col-sm-12 mx-1 card border-info mb-3'>
                        <h3 className='card-header'>Category</h3>
                        <div className='card-body'>
                            <h5 className='card-title'>Test</h5>
                            <h6 className='card-subtitle text-muted'>Support card subtitle</h6>
                        </div>
                        <img src='https://via.placeholder.com/150' alt='placeholder' className='d-block user-select-none' width='100%' height='200' aria-label='Placeholder: Image Cap'>
                        </img>
                        <div className="card-body">
                            <p className="card-text">Test
                            </p>
                        </div>
                        <div className="card-body text-center">
                            <a href="#" className="card-link">Card link</a>
                        </div>
                    </div>
                </main >
            </div >
        </div >
    );
};

export default Category;
