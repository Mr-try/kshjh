$(function(){
    //力导向图
    var chart01=function(){
        var w = 300;
        var h = 300;
        var svg = d3.select("#chart01").append("svg").attr({"width":w,"height":h});
        d3.json("json/relation.json",function(error,root){
            var edgestemp=[];
            if( error ){
                return console.log(error);
            }
            root.edges.forEach(function(e) {
                var sourceNode = root.nodes.filter(function(n) { return n.id === e.source; })[0],
                    targetNode = root.nodes.filter(function(n) { return n.id === e.target; })[0];
                edgestemp.push({source: sourceNode, target: targetNode,relation: e.relation});
            });
            //定义颜色
            var color_father_start="#CDB7B5";
            var color_father_end="#CD5B45";
            var color_son_start="#CD919E";
            var color_son_end="#CD2626";
            var color_edges_text_start="#2F4F4F";
            var color_edges_text_end="#000000";
            //定义连线长度
            var link_length_tongji=160;
            var link_length_ziji=80;
            //定义园的半径
            var cir_father=15;
            var cir_son=5;

            var force = d3.layout.force()
                .nodes(root.nodes)
                .links(edgestemp)
                .size([w,h])
                .linkDistance(function(d){
                    if(d.relation=="碳碳键"){
                        return link_length_tongji
                    }
                    else {
                        return link_length_ziji
                    }
                })
                .charge([-300])
                .theta(0.1)
                .gravity(0.05)
                .start();


            //连线上添加箭头
            var edges_line = svg.selectAll("line")
                .data(edgestemp)
                .enter()
                .append("line")
                .attr("id",function(d,i) {return 'edge'+i})
                .attr('marker-end',function(d){
                    if(d.relation=="碳碳键"){
                        return 'url(#arrowhead)'
                    }
                    else {
                        return 'url(#arrowhead2)'
                    }
                })
                .style("stroke","#ccc")
                .style("pointer-events", "none");
            //添加节点
            var nodes = svg.selectAll("circle")
                .data(root.nodes)
                .enter()
                .append("circle")
                .attr("id",(function(d){return d.index}))
                .attr("r",function (d){
                    if(d.class==="father"){
                        return cir_father
                    }
                    else
                        return cir_son;
                })
                .style("fill",function(d,i){
                    if(d.class==="father"){
                        return color_father_start;
                    }
                    else {
                        return color_son_start;
                    }
                })
                .style("cursor","pointer")
                .on("mouseover",function(d,i){
                    var tempnum=this.getAttribute("id");
                    //显示连接线上的文字、改变连线与圆形大小及箭头颜色
                    svg.selectAll('marker').attr("fill","red");
                    edges_text.transition()
                        .duration(1500)
                        .style("fill",function(edge){
                            if( edge.source === d || edge.target === d ){
                                return color_edges_text_end;
                            }
                        });
                    edges_text.style("fill-opacity",function(edge){
                        if( edge.source === d || edge.target === d ){
                            return 1.0;
                        }
                    });
                    edges_line.transition().duration(1500).style("stroke",function(edge){
                        if( edge.source === d || edge.target === d ) {
                            return color_father_end;
                        }
                        else {
                            return "#ccc";
                        }
                    });

                    nodes.transition()
                        .duration(1500)
                        .attr("fill",function(d){
                            if(d.class==="father"&&tempnum==this.getAttribute("id")){
                                return "red";
                            }
                            else
                                return this.getAttribute("r")
                        })
                        .style("fill",function(d){
                            if(d.class==="father"){
                                if(tempnum==this.getAttribute("id")){
                                    return color_father_end;
                                }
                                else {
                                    return color_father_start;
                                }
                            }
                            else{
                                if(tempnum==this.getAttribute("id")){
                                    return color_son_end;
                                }
                                else {
                                    return  color_son_start;
                                }
                            }
                        })
                })
                .on("mouseout",function(d,i){
                    //隐去连接线上的文字
//              edges_text.style("fill",function(edge){
//                        if( edge.source === d || edge.target === d ){
//                          return color_edges_text_start;
//                        }
//                      });
//              edges_text.style("fill-opacity",function(edge){
////                if( edge.source === d || edge.target === d ){
//                  return 0.0;
////                }
//              });
//              edges_line.style("stroke",function(){return "#ccc"});
                    nodes.transition()
                        .duration(1000)
                        .style("fill",function(d){
                            if(d.class==="father"){
                                return color_father_start;
                            }
                            else {
                                return color_son_start;
                            }
                        })
                })
                .call(force.drag);

            //圆形内部文字
            var node_text = svg.selectAll(".nodelabel")
                .data(root.nodes)
                .enter()
                .append("text")
                .style("cursor","pointer")
                .attr({"x":function(d){return d.x;},
                    "y":function(d){return d.y;},
                    "class":"nodelabel",
                    "stroke":"black"})
                .text(function(d){return d.name;});

            var edgepaths = svg.selectAll(".edgepath")
                .data(edgestemp)
                .enter()
                .append('path')
                .attr({'d': function(d) { return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y},
                    'class':'edgepath',
                    'fill-opacity':0,
                    'stroke-opacity':0,
                    'fill':'blue',
                    'stroke':'red',
                    'id':function(d,i) {return 'edgepath'+i}})
                .style("pointer-events", "none");

            //添加线上文字
            var edges_text = svg.selectAll(".linetext")
                .data(edgestemp)
                .enter()
                .append('text')
                .style("pointer-events", "none")
                .attr({'class':'linetext','id':function(d,i){ return 'linetext'+i}
                    ,'dx':function(d){ if(d.relation=="碳碳键"){
                        return link_length_tongji/2-20
                    }
                    else {
                        return link_length_ziji/2-15
                    }
                    },
                    'dy':0, 'font-size':6,'fill':color_edges_text_start})
                .append('textPath')
                .attr('xlink:href',function(d,i) {return '#edgepath'+i})
                .style("pointer-events", "none")
                .style("fill", "#ccc")
                .text(function(d){
                    return d.relation;
                });
            //设置箭头1
            svg.append('defs').append('marker')
                .attr({'id':'arrowhead2',
                    'viewBox':'-0 -5 10 10',
                    'refX':cir_son+10,
                    'refY':0,
                    'markerUnits':'strokeWidth',
                    'orient':'auto',
                    'markerWidth':10,
                    'markerHeight':10,
                    'xoverflow':'visible'})
                .append('svg:path')
                .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                .attr('fill', '#ccc')
                .attr('stroke','#ccc');
            //设置箭头2
            svg.append('defs').append('marker')
                .attr({'id':'arrowhead',
                    'viewBox':'-0 -5 10 10',
                    'refX':cir_father+10,
                    'refY':0,
                    'markerUnits':'strokeWidth',
                    'orient':'auto',
                    'markerWidth':10,
                    'markerHeight':10,
                    'xoverflow':'visible'})
                .append('svg:path')
                .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                .attr('fill', '#ccc')
                .attr('stroke','#ccc');


            force.on("tick", function(){
                edges_line.attr({"x1": function(d){return d.source.x;},
                    "y1": function(d){return d.source.y;},
                    "x2": function(d){return d.target.x;},
                    "y2": function(d){return d.target.y;}
                });
                nodes.attr({"cx":function(d){return d.x;}, "cy":function(d){return d.y;}});
                node_text.attr("x", function(d) { return d.x; }).attr("y", function(d) { return d.y; });
                edgepaths.attr('d', function(d) { var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;return path});
                edges_text.attr('transform',function(d,i){
                    bbox = this.getBBox();
                    rx = bbox.x+bbox.width/2;
                    ry = bbox.y+bbox.height/2;
                    if (d.target.x<d.source.x){
                        return 'rotate(180 '+rx+' '+ry+')';
                    }
                    else {
                        return 'rotate(0)';
                    }
                });
//      edges_text.attr("x",function(d){return (Math.abs(d.source.x + d.target.x) / 2 ); });
//      edges_text.attr("y",function(d){return (Math.abs(d.source.y + d.target.y) / 2 ); });
            });
        });
    };
    //弦图
    var chart02=function(){
        //1.定义数据
        // 城市名
        var city_name = [ "北京" , "上海" , "广州" , "深圳" , "香港" ,"福州" ];

        // 城市人口的来源，如
        //				北京		上海
        //	北京		1000		3045
        //	上海		3214		2000
        // 表示北京市的人口有1000个人来自本地，有3045人是来自上海的移民，总人口为 1000 + 3045
        // 上海市的人口有2000个人来自本地，有3214人是来自北京的移民，总人口为 3214 + 2000
        var population = [
            [ 1000,  3045　 , 4567　, 1234 , 3714,255 ],
            [ 3214,  2000　 , 2060　, 124  , 3234 ,1033],
            [ 8761,  6545　 , 3000　, 8045 , 647  ,223],
            [ 3211,  1067  , 3214 , 4000  , 1006 ,2020],
            [ 2146,  1034　 , 6745 , 4764  , 5000 ,777],
            [ 1111,  4334　 , 2421 , 1132  , 677 ,777]
        ];

        var width  = 300;
        var height = 300;
        var innerRadius = width/2 -30;
        var outerRadius = innerRadius +20;
        var color=["#CDB7B5","#CDAF95","#CD8C95","#CD7054","#CD661D","#CD5B45"];
        
        var formatPercent=d3.format(".1%");
        //从关系矩阵生产一个弦图
        var layout = d3.layout.chord()
            .padding(0.03)		           //节点之间的间隔
            .sortSubgroups(d3.descending)	//排序
            .matrix(population);	        //输入矩阵
        //新建一个弧度生成器，用来画弧（设置内圆半径、外圆半径）
        var arc=d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);
        //新建一个弦生成器，用来画弦
        var path=d3.svg.chord().radius(innerRadius);
        //生成父节点
        var svg = d3.select("#chart02").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("id","circle")
            .attr("transform", "translate(" + width/2 + "," + height/2 + ")");
        //画外圈的大圆，svg的第一个孩子
        svg.append("circle").attr("r",outerRadius);
        //扇区生成器、每个扇区都是一个group，包括title、path(arc)、text三个孩子
        var group=svg.selectAll(".group").data(layout.groups).enter().append("g").attr("class","group")
            .on("mouseover", function(d, i) {
                chord.classed("fade", function(p) {
                    return p.source.index != i
                        && p.target.index != i;
                });
            })
            .on("mouseout", function(d, i) {
                chord.classed("fade", function(p) {
                    return 0
                });
            })
        //鼠标停留显示的提示
        group.append("title").text(function(d,i){return city_name[i]});
        //画弧
        var groupPath=group.append("path")
            .attr("id", function(d, i) { return "group" + i; })
            .style("fill", function(d) {return color[d.index]; })
            .attr("d", arc)
            .attr("class", function(d, i) {return city_name[i]});
        
        //添加文本标识
        var groupText = group.append("text")
            .attr("x", 6)
            .attr("dy", 15);
        groupText.append("textPath")
            .attr("xlink:href", function(d, i) { return "#group" + i; })
            .text( function(d, i) { return city_name[i]; } );
        //添加过滤
        groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
            .remove();
        //每条连线两个邻边都是一个path，拥有一个title孩子，所有的边在一起叫chord
        var chord = svg.selectAll(".chord")
            .data(layout.chords)
            .enter().append("path")
            .attr("class", "chord")
            .style("fill", function(d) { return color[d.source.index]; })
            .attr("d", path)
            .on("mouseover",function(d,i){
                d3.select(this)
                .style("fill","#EEEE00");
            })
            .on("mouseout",function(d,i) {
                d3.select(this)
                    .transition()
                    .duration(1000)
                    .style("fill",color[d.source.index]);
            });
    };
    
    //树状图
    var chart03=function(){
        var m = [20, 120, 20, 20],
            w = 300 - m[1] - m[3],
            h = 300 - m[0] - m[2],
            i = 0,
            root;

        var tree = d3.layout.tree()
            .size([h, w]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var vis = d3.select("#chart03").append("svg:svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        d3.json("json/flare.json", function(json) {
            root = json;
            root.x0 = h / 2;
            root.y0 = 0;

            function toggleAll(d) {
                if (d.children) {
                    d.children.forEach(toggleAll);
                    toggle(d);
                }
            }

            // Initialize the display to show a few nodes.
            root.children.forEach(toggleAll);
            toggle(root.children[1]);
            toggle(root.children[1].children[2]);
            toggle(root.children[2]);
            toggle(root.children[2].children[0]);

            update(root);
        });

        function update(source) {
            var duration = d3.event && d3.event.altKey ? 5000 : 500;

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse();

            // Normalize for fixed-depth.
            nodes.forEach(function(d) { d.y = d.depth * 180; });

            // Update the nodes…
            var node = vis.selectAll("g.node")
                .data(nodes, function(d) { return d.id || (d.id = ++i); });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("svg:g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                .on("click", function(d) { toggle(d); update(d); });

            nodeEnter.append("svg:circle")
                .attr("r", 1e-6)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

            nodeEnter.append("svg:text")
                .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                .text(function(d) { return d.name; })
                .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

            nodeUpdate.select("circle")
                .attr("r", 4.5)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = vis.selectAll("path.link")
                .data(tree.links(nodes), function(d) { return d.target.id; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("svg:path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                })
                .transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

// Toggle children.
        function toggle(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
        }
    };
    
    //地图
    var chart06=function(){
        var width=300;
        var height=300;
        var svg = d3.select("#chart06").append("svg")
            .attr("width", width)
            .attr("height", height);


        var projection = d3.geo.mercator()
            .center([118.4, 26])
            .scale(2100)
            .translate([width/2, height/2]);

        var path = d3.geo.path()
            .projection(projection);
        
        //添加标线
        var defs=svg.append("defs");
        var arrowMarker = defs.append("marker")
            .attr("id","arrow")
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth","12")
            .attr("markerHeight","12")
            .attr("viewBox","0 0 12 12")
            .attr("refX","6")
            .attr("refY","6")
            .attr("orient","auto");

        var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";

        arrowMarker.append("path")
            .attr("d",arrow_path)
            .attr("fill","#000");

        var startMarker = defs.append("marker")
            .attr("id","startPoint")
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth","12")
            .attr("markerHeight","12")
            .attr("viewBox","0 0 12 12")
            .attr("refX","6")
            .attr("refY","6")
            .attr("orient","auto");

        startMarker.append("circle")
            .attr("cx",6)
            .attr("cy",6)
            .attr("r",2)
            .attr("fill","#000");
        var color=["#CDB7B5","#CDAF95","#CD8C95","#CD7054","#CD661D","#CD5B45","#CD4B45","#CD3B45","#CD2B45","#CD1B45"];

        d3.json("json/fujian.json", function(error, georoot) {
            if (error)
                return console.error(error);
            
            //包含中国各省路径的分组元素
            var china = svg.append("g");

            //添加中国各种的路径元素
            var provinces = china.selectAll("path")
                .data( georoot.features )
                .enter()
                .append("path")
                .attr("class","province")
                .attr("fill", function(d,i){
                    return color[i];
                })
                .attr("d", path )
                .attr("stroke","#000")
                .attr("stroke-width",1)
                .attr("fill", function(d,i){
                    return color[i];
                })
                .attr("d", path )
                .on("mouseover",function(d,i){
                    d3.select(this)
                        .attr("fill","yellow");
                })
                .on("mouseout",function(d,i){
                    d3.select(this)
                        .attr("fill",color[i]);
                });
        
            //插入标注
            d3.json("json/places.json", function(error, places ) {
                //插入标线
                svg.selectAll("line")
                    .data(places.location)
                    .enter()
                    .append("line")
                    .attr("class","route")
                    .attr("x1",function(d){
                        return  projection([d.oldlog, d.oldlat])[0]
                    })
                    .attr("y1",function(d){
                        return  projection([d.oldlog, d.oldlat])[1]
                    })
                    .attr("x2",function(d){
                        return  projection([d.log, d.lat])[0]
                    })
                    .attr("y2",function(d){
                        return  projection([d.log, d.lat])[1]
                    })
                    .attr("marker-end","url(#arrow)")
                    .attr("marker-start","url(#startPoint)");
                
                //插入分组元素
                var location = svg.selectAll(".location")
                    .data(places.location)
                    .enter()
                    .append("g")
                    .attr("class","location")
                    .attr("transform",function(d){
                        //计算标注点的位置
                        var coor = projection([d.log, d.lat]);
                        return "translate("+ coor[0] + "," + coor[1] +")";
                    });
                location.append("circle")
                    .attr("r",1);
                location.append("text")
                    .attr("x",0)
                    .attr("y",-10)
                    .attr("width",90)
                    .attr("height",10)
                    .text(function(d,i){
                        return d.name
                    })
            });
        });


    };
    //打包图
    var chart07=function(){
        var width=300;
        var height=300;
        var pack=d3.layout.pack().size([width,height]).radius(25);
        var svg=d3.select("#chart07").append("svg").attr("width",width).attr("height",height).append("g").attr("transform","translate(0,0)");
        var root = {
            "name":"DOTA2",
            "children":
                [
                    {
                        "name":"CN" ,
                        "value":52,
                        "children":
                            [
                                {"name":"Wings" ,"value":10},
                                {"name":"Newbeen" ,"value":15},
                                {"name":"lgd" ,"value":20},
                                {"name":"ig","value":25 }
                            ]
                    },
                    {
                        "name":"NOTCN" ,
                        "value":52,
                        "children":
                            [
                                {"name":"EG","value":10},
                                {"name":"OG","value":15},
                                {"name":"DC","value":20},
                                {"name":"垃圾","value":25}
                            ]
                    }
                ]
        };
        var nodes=pack.nodes(root);
        var links=pack.links(nodes);
        var color=["#CDB7B5","#CDAF95","#CD8C95","#CD7054","#CD661D","#CD5B45","#CDB7B5","#CDAF95","#CD8C95","#CD7054","#CD661D","#CD5B45"];
        svg.selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("fill",function(d,i){return color[i]})
            .style("stroke","black")
            .style("stroke-width","1px")
            .style("stroke-opacity",0.3)
            .attr("cx",function(d){return d.x;})
            .attr("cy",function(d){return d.y;})
            .attr("r",function(d){return d.r;});
        svg.selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr("font-size","10px")
            .attr("fill",function(d){
                if(d.depth==2){
                    return "#fff";
                }
                return "#000";
            })
            .style("text-anchor","middle")
            .attr("x",function(d){
                return d.x; 
            })
            .attr("y",function(d){
                if(d.depth==0){
                    return d.y-100;
                }
                if(d.depth==1){
                    return d.y-55;
                }
                return d.y;
            })
            .attr("dy",4)
            .text(function(d){ return d.name; });

    };
    
    //分区图
    var chart08=function(){
            var width = 300,
                height = 300,
                color = d3.scale.category20();
        var svg = d3.select("#chart08").append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g");

            var partition = d3.layout.partition()
                .sort(null)
                .size([width, height])
                .value(function (d) {
                    return 1;
                });


            d3.json("json/dota2.json", function (error, root) {

                if (error)
                    console.log(error);

                var nodes = partition.nodes(root);
                var links = partition.links(nodes);

                var rects = svg.selectAll("g")
                    .data(nodes)
                    .enter().append("g");

                rects.append("rect")
                    .attr("x", function (d) {
                        return d.y;
                    })
                    .attr("y", function (d) {
                        return d.x;
                    })
                    .attr("width", function (d) {
                        return d.dy;
                    })
                    .attr("height", function (d) {
                        return d.dx;
                    })
                    .style("stroke", "#fff")
                    .style("fill", function (d,i) {
                        return color((d.children ? d : d.parent).name);
                    })
                    .on("mouseover", function (d) {
                        d3.select(this)
                            .style("fill", "yellow");
                    })
                    .on("mouseout", function (d) {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .style("fill", function (d,i) {
                                return color((d.children ? d : d.parent).name);
                            });
                    });

                rects.append("text")
                    .attr("class", "node_text")
                    .attr("transform", function (d, i) {
                        return "translate(" + (d.y + 5) + "," + (d.x + 20) + ")";
                    })
                    .text(function (d, i) {
                        return d.name;
                    });

            });

    };
    
    //捆图
    var chart09=function(){
        var width  = 300;	//SVG绘制区域的宽度
        var height = 300;	//SVG绘制区域的高度

        var svg = d3.select("#chart09")			//选择<body>
            .append("svg")			//在<body>中添加<svg>
            .attr("width", width)	//设定<svg>的宽度属性
            .attr("height", height);//设定<svg>的高度属性


        //1. 确定初始数据
        var cities = {
            name: "",
            children:[
                {name: "A站"},{name: "B站"},{name: "C站"},
                {name: "D站"},{name: "E站"},{name: "F站"},
                {name: "G站"},{name: "H站"},{name: "I站"}
            ]
        };

        var railway = [
            {source: "A站", target: "B站"},
            {source: "A站", target: "C站"},
            {source: "A站", target: "D站"},
            {source: "A站", target: "E站"},
            {source: "A站", target: "F站"},
            {source: "B站", target: "G站"},
            {source: "B站", target: "H站"},
            {source: "B站", target: "I站"},
            {source: "C站", target: "B站"},
            {source: "D站", target: "B站"},
            {source: "E站", target: "B站"},
            {source: "F站", target: "H站"}
        ];
        //2. 转换数据
        var cluster = d3.layout.cluster()
            .size([360, width/2 - 50])
            .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

        var bundle = d3.layout.bundle();

        var nodes = cluster.nodes(cities);

        var oLinks = map(nodes, railway);

        var links = bundle(oLinks);
        //将links中的source和target由名称替换成节点
        function map( nodes, links ){
            var hash = [];
            for(var i = 0; i < nodes.length; i++){
                hash[nodes[i].name] = nodes[i];
            }
            var resultLinks = [];
            for(var i = 0; i < links.length; i++){
                resultLinks.push({  source: hash[ links[i].source ],
                    target: hash[ links[i].target ]
                });
            }
            return resultLinks;
        }

        //3. 绘图
        var line = d3.svg.line.radial()
            .interpolate("bundle")
            .tension(.85)
            .radius(function(d) { return d.y; })
            .angle(function(d) { return d.x / 180 * Math.PI; });

        gBundle = svg.append("g")
            .attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");

        var color=["#CDB79E","#CDB38B","#CDAF95","#CD9B9B","#CD919E","#CD919E","#CD8162","#CD7054","#CD6839"];

        var link = gBundle.selectAll(".links")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "links")
            .attr("stroke","#333")
            .attr("d", line);	//使用线段生成器

        var node = gBundle.selectAll(".nodes")
            .data( nodes.filter(function(d) {return !d.children; }) )
            .enter()
            .append("g")
            .attr("class", "nodes")
            .attr("transform", function(d) {
                return "rotate(" + (d.x- 90) + ")translate(" + d.y + ")" + "rotate("+ (90 - d.x) +")";
            })
            .on("mouseover",function(d,i){
                link.attr("stroke", function(i,j) {
                    if(d.name== i[0].name||d.name== i[2].name){
                        return "red"
                    }
                    else {
                        return "#333"
                    }
                });
                
            })
            .on("mouseout", function(d, i) {
                link.attr("stroke", function() {
                        return "#333"
                });
            })

        node.append("circle")
            .attr("r", 20)
            .style("fill",function(d,i){ return color[i]; })
            .style("cursor","pointer");

        node.append("text")
            .attr("dy",".2em")
            .style("text-anchor", "middle")
            .style("cursor","pointer")
            .text(function(d) { return d.name; });
    };
    
    //雷达图
    var chart10=function(){
        var margin = {top: 100, right: 100, bottom: 100, left: 100},
            width = Math.min(300, window.innerWidth - 10) - margin.left - margin.right,
            height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
        var data = [
            [//iPhone
                {axis:"A",value:0.22},
                {axis:"B",value:0.28},
                {axis:"C",value:0.29},
                {axis:"D",value:0.17},
                {axis:"E",value:0.22},
                {axis:"F",value:0.02},
                {axis:"G",value:0.21},
                {axis:"H",value:0.50}
            ],[//Samsung
                {axis:"A",value:0.27},
                {axis:"B",value:0.16},
                {axis:"C",value:0.35},
                {axis:"D",value:0.13},
                {axis:"E",value:0.20},
                {axis:"F",value:0.13},
                {axis:"G",value:0.35},
                {axis:"H",value:0.38}
            ],[//Nokia Smartphone
                {axis:"A",value:0.26},
                {axis:"B",value:0.10},
                {axis:"C",value:0.30},
                {axis:"D",value:0.14},
                {axis:"E",value:0.22},
                {axis:"F",value:0.04},
                {axis:"G",value:0.41},
                {axis:"H",value:0.30}
            ]
        ];
        var color = d3.scale.ordinal()
            .range(["#EDC951","#CC333F","#00A0B0"]);

        var radarChartOptions = {
            w: width,
            h: height,
            margin: margin,
            maxValue: 0.5,
            levels: 5,
            roundStrokes: true,
            color: color
        };
        //Call function to draw the Radar chart
        RadarChart("#chart10", data, radarChartOptions);
    }
    
    //矩阵图
    var chart11=function(){
        var width = 300,
            height = 300,
            color=["#CDB7B5","#CDAF95","#CD8C95","#CD7054","#CD661D","#CD5B45"];
        var svg = d3.select("#chart11").append("svg")
            .attr("width", width)
            .attr("height", height);

        var treemap = d3.layout.treemap()
            .size([width, height])
            .value(function(d){ return d.gdp; });

        d3.json("json/citygdp.json", function(error, root) {

            var nodes = treemap.nodes(root);
            var links = treemap.links(nodes);
            var groups = svg.selectAll("g")
                .data(nodes.filter(function(d){ return !d.children; }))
                .enter()
                .append("g");

            var rects = groups.append("rect")
                .attr("class","nodeRect")
                .attr("x",function(d){ return d.x; })
                .attr("y",function(d){ return d.y; })
                .attr("width",function(d){ return d.dx; })
                .attr("height",function(d){ return d.dy; })
                .style("fill",function(d,i){ 
                    return color[d.parent.cityno]; 
                });

            var texts = groups.append("text")
                .attr("class","nodeName")
                .attr("x",function(d){ return d.x; })
                .attr("y",function(d){ return d.y; })
                .attr("dx","0.5em")
                .attr("dy","1.5em")
                .text(function(d){
                    return d.name + " " + d.gdp;
                });
        });

    };
    chart01();
    chart02();
    chart03();
    chart06();
    chart07();
    chart08();
    chart09();
    chart10();
    chart11();
});
