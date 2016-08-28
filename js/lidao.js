/**
 * Created by try on 2016.8.26.
 */
$(function(){
        var w = 1000;
        var h = 700;
        var svg = d3.select("#chart01").append("svg").attr({"width":w,"height":h});
        //d3.json("json/relation.json",function(error,root){
        //   
        //});
        //
    $.getJSON(
        "json/lidao.json",
        function(data){
            var root=data.data
            console.log(data);
            var edgestemp=[];
            root.edges.forEach(function(e) {
                var sourceNode = root.nodes.filter(function(n) { return n.id === e.source; })[0],
                    targetNode = root.nodes.filter(function(n) { return n.id === e.target; })[0];
                edgestemp.push({source: sourceNode, target: targetNode,relation: e.relation});
            });
            //定义颜色
            var color_father_start="#2394ce";
            var color_father_end="#337ab7";
            var color_son_start="#f25a29";
            var color_son_end="#a94442";
            var color_edges_text_start="#2F4F4F";
            var color_edges_text_end="#000000";
            //定义连线长度
            var link_length_tongji=260;
            var link_length_ziji=180;
            //定义园的半径
            var cir_father=50;
            var cir_son=25;

            var force = d3.layout.force()
                .nodes(root.nodes)
                .links(edgestemp)
                .size([w,h])
                .linkDistance(function(d){
                    if(d.target.type=="企业"){
                        return link_length_tongji+d.relation.length*10
                    }
                    else {
                        return link_length_ziji+d.relation.length*10
                    }
                })
                .charge([-300])
                .theta(0.1)
                .gravity(0.05)
                .start();


            //连线、箭头
            var edges_line = svg.selectAll("line")
                .data(edgestemp)
                .enter()
                .append("line")
                .attr("id",function(d,i) {return 'edge'+i})
                .attr('marker-end',function(d){
                    if(d.target.type=="企业"){
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
                    if(d.type==="企业"){
                        return cir_father
                    }
                    else
                        return cir_son;
                })
                .style("fill",function(d,i){
                    if(d.type==="企业"){
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
                            if(d.type==="企业"&&tempnum==this.getAttribute("id")){
                                return "red";
                            }
                            else
                                return this.getAttribute("r")
                        })
                        .style("fill",function(d){
                            if(d.type==="企业"){
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
                            if(d.type==="企业"){
                                return color_father_start;
                            }
                            else {
                                return color_son_start;
                            }
                        })
                })
                .call(force.drag);

            //圆形内部文字

            //d第一行文字
            var node_text = svg.selectAll(".nodelabel")
                .data(root.nodes)
                .enter()
                .append("text")
                .style("cursor","pointer")
                .attr({"x":function(d){
                    if(d.type==="企业"){
                        return d.x-cir_father
                    }
                    return d.x-cir_son+6;},
                    "y":function(d){
                        if(d.type==="自然人"){
                            return d.y+6
                        }
                        return d.y;},
                    "class":"nodelabel",
                })
                .text(function(d){return d.name.substring(0,9);});
            //第二行文字
            var node_text2 = svg.selectAll(".nodelabel2")
                .data(root.nodes)
                .enter()
                .append("text")
                .style("cursor","pointer")
                .attr({"x":function(d){
                    if(d.type==="企业"){
                        return d.x-cir_father+3
                    }
                    return d.x-cir_son+6;},
                    "y":function(d){
                        return d.y+13;},
                    "class":"nodelabel",
                })
                .text(function(d){
                    if(d.name.length>=15){
                        return d.name.substring(9,16)+"…";
                    }
                    return d.name.substring(9,16);
                });

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
                    ,'dx':function(d){ if(d.target.type=="企业"){
                        return (link_length_tongji+d.relation.length*6)/2-d.relation.length*3
                    }
                    else {
                        return (link_length_ziji+d.relation.length*6)/2-d.relation.length*2
                    }
                    },
                    'dy':-1,
                    'font-size':6,
                    'fill':color_edges_text_start,
                })
                .append('textPath')
                .attr('xlink:href',function(d,i) {return '#edgepath'+i})
                .style("pointer-events", "none")
                .style("fill", "#ccc")
                .style("background-color","red")
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
                edges_line.attr({
                    "x1": function(d,i){return d.source.x;},
                    "y1": function(d,i){return d.source.y;},
                    "x2": function(d,i){return d.target.x;},
                    "y2": function(d,i){return d.target.y;}
                });
                nodes.attr({"cx":function(d){return d.x;}, "cy":function(d){return d.y;}});
                node_text
                    .attr({"x":function(d){
                        if(d.type==="企业"){
                            return d.x-cir_father
                        }
                        return d.x-cir_son+9;}})
                    .attr("y", function(d) {
                        if(d.type==="自然人"){
                            return d.y+6
                        } return d.y; });
                node_text2
                    .attr({"x":function(d){
                        if(d.type==="企业"){
                            return d.x-cir_father+3
                        }
                        return d.x-cir_son+2;}})
                    .attr("y", function(d) { return d.y+13; });
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
        }
    )
})