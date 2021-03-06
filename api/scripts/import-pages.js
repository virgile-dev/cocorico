#!/usr/bin/env headstone
var config = require('../config.json');

var async = require('async');
var keystone = require('keystone');
var stringify = require('json-stable-stringify');
var fs = require('fs');
var path = require('path');

var Page = keystone.list('Page'),
    Media = keystone.list('Media');

function find(startPath,filter)
{
    var res = [];
    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (filename.indexOf(filter)>=0) {
            res.push(filename);
        };
    };

    return res;
}

module.exports = function(done)
{
    var pageFiles = find('./db/pages', '.json');
    var mediaFiles = find('./db/media', '.json');

    async.waterfall(
        mediaFiles.map((mediaFile) => (callback) => {
            var mediaData = JSON.parse(fs.readFileSync(mediaFile));

            Media.model.findOne({slug: mediaData.slug})
                .exec((err, media) => {
                    if (err)
                        return callback(err);

                    if (media) {
                        var time1 = new Date(media.updatedAt).getTime();
                        var time2 = new Date(mediaData.updatedAt).getTime();

                        if (mediaData.updatedAt && time1 == time2)
                            return callback(null);
                    }

                    Media.model.update(
                        {slug: mediaData.slug},
                        mediaData,
                        {upsert: true},
                        (err) => {
                            console.log('Updated media "' + mediaData.slug + '"');
                            return callback(err);
                        }
                    );
                });
        }),
        (err, result) => {
            async.waterfall(
                pageFiles.map((pageFile) => (callback) => {
                    var pageData = JSON.parse(fs.readFileSync(pageFile));

                    Page.model.findOne({slug: pageData.slug})
                        .exec((err, page) => {
                            if (err)
                                return callback(err);

                            if (page) {
                                var time1 = new Date(page.updatedAt).getTime();
                                var time2 = new Date(pageData.updatedAt).getTime();

                                if (pageData.updatedAt && time1 == time2)
                                return callback(null);
                            }

                            if (pageData.contentType == 'HTML')
                                pageData.html = fs.readFileSync('./db/pages/' + pageData.slug + '.html', 'utf8');
                            else
                                pageData.markdown = { md : fs.readFileSync('./db/pages/' + pageData.slug + '.md', 'utf8')};

                            Page.model.update(
                                {slug: pageData.slug},
                                pageData,
                                {upsert: true},
                                (err) => {
                                    console.log('Updated page "' + pageData.slug + '"');
                                    return callback(err);
                                }
                            );
                        });
                }),
                done
            );
        }
    );
}
