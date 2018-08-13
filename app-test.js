const express = require('express');
const app = express();
const rx = require('rx');

rx.Observable.if(it=>false,
    rx.Observable.just(1),
    rx.Observable.just(2)).subscribe(
        next => {
            console.log(next);
        }
    )
