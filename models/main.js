var http = require('http');
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var url = require('url');
var request = require('request')
function mainPage(req, res) {
    function defHeader(req, res) {
        rigArray = [["Rig 1", "http://192.168.1.141:3333/"], ["Rig 2", "http://192.168.1.142:3333/"],  ["Rig 3", "http://192.168.1.143:3333/"]]
            header = '\
            <!DOCTYPE html>\
            <html>\
                <head>\
                    <!DOCTYPE html>\
                        <html lang="en">\
                        <title>\
                            My Mining Rigs\
                        </title>\
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">\
                </head>'
            tableHeader='\
                <div style="width:100%;height:100%;background:rgb(200,205,200);text-align: center;">\
                    <div style="width:90%;height:100%;background:rgb(200,210,205);display:inline-block;position:relative;align:center;margin:0 auto;">\
                        <table style="width:100%">\
                            <tr>\
                                <th style="width:8%;">Rig</th>\
                                <th style="width:8%;">Status</th>\
                                <th style="width:8%;">GPU 0</th>\
                                <th style="width:8%;">GPU 1</th>\
                                <th style="width:8%;">GPU 2</th>\
                                <th style="width:8%;">GPU 3</th>\
                                <th style="width:8%;">GPU 4</th>\
                                <th style="width:8%;">GPU 5</th>\
                                <th style="width:8%;">GPU 6</th>\
                                <th style="width:28%;">Total Hash Rate</th>\
                            </tr>'
            getReports(req, res, rigArray, getReportCb)
            footer='\
                    </div>\
                </div>\
            </html>'

            res.write(header)
            res.write(tableHeader)
            res.write(footer)
            //res.end()
    }
    
    defHeader(req,res)
}
module.exports.mainPage = mainPage

function getReports(req, res, rigArray,cb) {
    rigArray.forEach(function (value) {
        request(value[1], function (error, response, body) {
            gpuArray = [[0, 0, 0, 0, 0, 0, 0], ["X", "X", "X", "X", "X", "X", "X"], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""]]
            if (body != undefined){
                var bodyArray = body.split("<")
                bodyArray.forEach(function (row) {
                    if (row.indexOf("ETH:") > -1 && row.indexOf("Mh/s") > -1) {
                        rowArray = row.split(",")                 
                        rowArray.forEach(function (value) {
                            if (value.indexOf("GPU0") > -1) {
                                start = value.indexOf("GPU0")
                                end = value.indexOf("Mh/s")
                                gpuSpeed = value.substr(start + 5, end - start - 5)
                                gpuArray[1][0]=gpuSpeed
                            }
                            if (value.indexOf("GPU1") > -1) {
                                start = value.indexOf("GPU1")
                                end = value.indexOf("Mh/s")
                                gpuSpeed = value.substr(start + 5, end - start - 5)
                                gpuArray[1][1] = gpuSpeed
                            }
                            if (value.indexOf("GPU2") > -1) {
                                start = value.indexOf("GPU2")
                                end = value.indexOf("Mh/s")
                                gpuSpeed = value.substr(start + 5, end - start - 5)
                                gpuArray[1][2] = gpuSpeed
                            }
                            if (value.indexOf("GPU3") > -1) {
                                start = value.indexOf("GPU3")
                                end = value.indexOf("Mh/s")
                                gpuSpeed = value.substr(start + 5, end - start - 5)
                                gpuArray[1][3] = gpuSpeed
                            }
                            if (value.indexOf("GPU4") > -1) {
                                start = value.indexOf("GPU4")
                                end = value.indexOf("Mh/s")
                                gpuSpeed = value.substr(start + 5, end - start - 5)
                                gpuArray[1][4] = gpuSpeed
                            }
                            if (value.indexOf("GPU5") > -1) {
                                start = value.indexOf("GPU5")
                                end = value.indexOf("Mh/s")
                                gpuSpeed = value.substr(start + 5, end - start - 5)
                                gpuArray[1][5] = gpuSpeed
                            }
                            if (value.indexOf("GPU6") > -1) {
                                start = value.indexOf("GPU6")
                                end = value.indexOf("Mh/s")
                                gpuSpeed = value.substr(start + 5, end - start - 5)
                                gpuArray[1][6] = gpuSpeed
                            }

                        })

                    }
                    if (row.indexOf("ETH - Total Speed:") > -1) {
                        start=row.indexOf(":")
                        end = row.indexOf("/")
                        totalSpeed = row.substr(start + 2, end - start)
                    }
                    if (row.indexOf("GPU #") > -1) {
                        if (row.indexOf("GPU #0") > -1) {
                            gpuArray[0][0] = 1
                            start = row.indexOf(">")
                            gpu1Info = row.substr(start)
                            gpuArray[3][0] = gpu1Info
                        }
                        if (row.indexOf("GPU #1") > -1) {
                            gpuArray[0][1] = 1
                            start = row.indexOf(">")
                            gpuInfo = row.substr(start)
                            gpuArray[3][1] = gpuInfo
                        }
                        if (row.indexOf("GPU #2") > -1) {
                            gpuArray[0][2] = 1
                            start = row.indexOf(">")
                            gpuInfo = row.substr(start)
                            gpuArray[3][2] = gpuInfo
                        }
                        if (row.indexOf("GPU #3") > -1) {
                            gpuArray[0][3] = 1
                            start = row.indexOf(">")
                            gpuInfo = row.substr(start)
                            gpuArray[3][3] = gpuInfo
                        }
                        if (row.indexOf("GPU #4") > -1) {
                            gpuArray[0][4] = 1
                            start = row.indexOf(">")
                            gpuInfo = row.substr(start)
                            gpuArray[3][4] = gpuInfo
                        }
                        if (row.indexOf("GPU #5") > -1) {
                            gpuArray[0][5] = 1
                            start = row.indexOf(">")
                            gpuInfo = row.substr(start)
                            gpuArray[3][5] = gpuInfo
                        }
                        if (row.indexOf("GPU #6") > -1) {
                            gpuArray[0][6] = 1
                            start = row.indexOf(">")
                            gpuInfo = row.substr(start)
                            gpuArray[3][6] = gpuInfo
                        }
                    }
                })
                cb(body, response, res, value[0],totalSpeed,gpuArray)
            }
            if (error) {
                failedPipe(res,value[0]);
            }
        })
    })
}

function getReportCb(data, response, res, rigName, totalSpeed, gpuArray) {
    if (response.statusCode == 200) {
        tableRow = '\
                            <table style="width:100%;">\
                                <tr>\
                                    <th style="width:8%;" >'+ rigName + '</th>\
                                    <th style="width:8%;"><i class="fa fa-angle-double-up" style="color:green"></i></th>\
                                    <th style="width:8%;" title="' + gpuArray[3][0] + '">' + gpuArray[1][0] + '</th>\
                                    <th style="width:8%;" title="' + gpuArray[3][1] + '">' + gpuArray[1][1] + '</th>\
                                    <th style="width:8%;" title="' + gpuArray[3][2] + '">' + gpuArray[1][2] + '</th>\
                                    <th style="width:8%;" title="' + gpuArray[3][3] + '">' + gpuArray[1][3] + '</th>\
                                    <th style="width:8%;" title="' + gpuArray[3][4] + '">' + gpuArray[1][4] + '</th>\
                                    <th style="width:8%;" title="' + gpuArray[3][5] + '">' + gpuArray[1][5] + '</th>\
                                    <th style="width:8%;" title="' + gpuArray[3][6] + '">' + gpuArray[1][6] + '</th>\
                                    <th style="width:28%;">' + totalSpeed + '</th>\
                                <tr>\
                            </table>'
        res.write(tableRow)
    }
    else {
        tableRow = '\
                            <table style="width:100%;">\
                                <tr>\
                                    <th style="width:8%;" >'+ rigName + '</th>\
                                    <th style="width:8%;"><i class="fa fa-angle-double-down" style="color:red"></i></th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:28%;">X</th>\
                            <tr>\
                            </table>'
        res.write(tableRow)
    }
}


function failedPipe(res,rigName) {
    tableRow = '\
                            <table style="width:100%;">\
                                <tr>\
                                    <th style="width:8%;" >'+ rigName + '</th>\
                                    <th style="width:8%;"><i class="fa fa-angle-double-down" style="color:red"></i></th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:8%;">X</th>\
                                    <th style="width:28%;">X</th>\
                            <tr>\
                            </table>'
    res.write(tableRow)
}