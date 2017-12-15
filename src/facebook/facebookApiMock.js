/**
 * Created by kucha on 03.12.2017.
 */

var mockFacebookAPI = function () {
    FB.login = function (callback) {
        callback({authResponse : 'authorized'});
    };
    FB.getLoginStatus = function (callback) {
        callback({status :'connected'})
    };
    FB.api = function(route, param, callback) {
        var response;
        if (route === "/me") {
            response = {
                "email": "kucharrom@gmail.com",
                "id": "10215232831076561",
                "name": "Roman Kuchy Kuchar",
                "picture": {
                    "data": {
                        "height": 50,
                        "is_silhouette": false,
                        "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/1916850_10209133985529234_6611487263668163491_n.jpg?oh=4210146f62b14ed4fd291c62fd175c41&oe=5A89CFC2",
                        "width": 50
                    }
                }
            };
        } else if (route === "/me/friends") {
            response = {
                "data": [
                    {
                        "id": "10213063045124094",
                        "first_name": "Katka",
                        "picture": {
                            "data": {
                                "height": 50,
                                "is_silhouette": false,
                                "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/14656407_10209385654871636_1102247790911259168_n.jpg?oh=b041346afbfe594f83f640e6515c7ac3&oe=5A8C64F2",
                                "width": 50
                            }
                        }
                    },
                    {
                        "id": "729710830555260",
                        "first_name": "Pavel",
                        "picture": {
                            "data": {
                                "height": 50,
                                "is_silhouette": false,
                                "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/20622241_677316762461334_2975552067227579696_n.jpg?oh=ecad991ad5e93cc6cef7355143b78b1c&oe=5AD193E7",
                                "width": 50
                            }
                        }
                    },
                    {
                        "id": "408422372906892",
                        "first_name": "Milan",
                        "picture": {
                            "data": {
                                "height": 50,
                                "is_silhouette": false,
                                "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/c146.166.778.778/s50x50/15871456_268555246893606_5255016867117510828_n.jpg?oh=80adfcf06132a5d4761440be6fcf546b&oe=5A8C1DC6",
                                "width": 50
                            }
                        }
                    }
                ],
                "paging": {
                    "cursors": {
                        "before": "QVFIUmFpdkdFdi1wSWpDdmZAxdzlDQkVhbjVFZA1R5N2h0alFDWWhpVkg2MVBMQmdYTHNGTDdOTmNabHVDanlBbGFKOEcZD",
                        "after": "QVFIUl9aNE5vd09yZA3c0UkhvenF0T2d4bHVOaXZAqWEpDNm9QU3lIX1NDbGw0eF9xN1FnOGlKN3lyWlBCWUFRdnVLY3FUa0JCNFhzR1V4dnkxdlo3VGxIMXln"
                    }
                },
                "summary": {
                    "total_count": 428
                }
            };
        }
        callback(response);
    }

};
