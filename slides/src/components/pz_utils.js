import panzoom from 'panzoom';
import { SVG as SVGjs } from '@svgdotjs/svg.js'
import config from '../../astro.config.mjs'

function search_to_query(search){
  return JSON.parse('{"' + decodeURI(search.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
}

function get_svg_id(image_id){
  let el = document.getElementById(image_id)
  if(!el){
    return null
  }
  if(el.tagName == "OBJECT"){
    //console.log(el)
    //console.log(el.contentDocument)
    //console.log(el.contentDocument.getElementsByTagName('svg')[0])
    //  console.log(el.getSVGDocument())
    //https://www.w3.org/TR/SVG2/struct.html#InterfaceGetSVGDocument
    //.getElementsbyTagName("svg")[0]
    return document.getElementById(image_id).contentDocument.getElementsByTagName('svg')[0]
  }
  else if(el.tagName == "svg"){
    return el
  }
}

function get_img_id(image_id){
  let el = document.getElementById(image_id)
  if(!el){
    return null
  }
  if(el.tagName == "IMG"){
    return el
  }
}

function get_size(image_id){
  if(image_id.endsWith(".svg")){
    let svg = get_svg_id(image_id)
    let bbox = svg.getBBox();
    return {img_width:bbox.width,img_height:bbox.height}
  }
  else{
    let img_id = get_img_id(image_id)
    let res = {img_width:img_id.naturalWidth,img_height:img_id.naturalHeight}
    return res
  }
}


function softReset(pzRef){
  if(! pzRef) return
  pzRef.zoomAbs(0, 0, 1);
  pzRef.moveTo(0, 0);
}

function Reset(pzRef,divRef,zoomOptions){
  if(! pzRef) return null
  pzRef.dispose();
  return panzoom(divRef, zoomOptions);
}

function Center(image_id,pzRef,pz_width,pz_height){
  if(! pzRef) return null
  //pzRef = Reset(pzRef,divRef,zoomOptions)
  softReset(pzRef)
  let svg = get_svg_id(image_id)
  //let cbox = svg.getBoundingClientRect();
  let {img_width, img_height} = get_size(image_id)
  let scale = pz_width / img_width
  if(image_id.endsWith(".svg")){
    if(svg.hasAttributeNS(null,"width")){
      let client_width = svg.getAttributeNS(null,"width")
      if(client_width.endsWith("px")){
        client_width = Number(client_width.slice(0,-2))
      }
      scale = client_width / img_width
    }
  }
  let offsetY         = pz_height/2 - (img_height*scale)/2
  let offsetX         = pz_width/2 - (img_width*scale)/2
  pzRef.moveTo(offsetX, offsetY);
  console.log(`moveto (${offsetX},${offsetY})`)
  return
}

function FitHeight(image_id,pzRef,pz_width,pz_height){
  if(! pzRef) return
  softReset(pzRef)
  //let cbox = svg.getBoundingClientRect();
  let {img_width, img_height} = get_size(image_id)
  let scale = 1
  if(image_id.endsWith(".svg")){
    scale = pz_width / img_width
    let svg = get_svg_id(image_id)
    if(svg.hasAttributeNS(null,"width")){
      let client_width = svg.getAttributeNS(null,"width")
      if(client_width.endsWith("px")){
        client_width = Number(client_width.slice(0,-2))
      }
      scale = client_width / img_width
    }
  }
  //console.log(`scale = ${scale}`)
  let offsetY         = pz_height/2 - (img_height*scale)/2
  let offsetX         = pz_width/2 - (img_width*scale)/2
  pzRef.moveTo(offsetX, offsetY);
  console.log(`moveTo (${offsetX},${offsetY})`)

  let zoomX           = pz_width/2
  let zoomY           = pz_height/2
  let fit_height_zoom  = pz_height/(img_height*scale)
  pzRef.zoomAbs(zoomX, zoomY, fit_height_zoom);
  console.log(`zoomAbs (${zoomX},${zoomY},${fit_height_zoom})`)
}
function FitWidth(image_id,pzRef,pz_width,pz_height){
  if(! pzRef) return
  softReset(pzRef)
  //let cbox = svg.getBoundingClientRect();
  let {img_width, img_height} = get_size(image_id)
  console.log(`pz_width,pz_height : (${pz_width} , ${pz_height})`)
  let scale = 1
  if(image_id.endsWith(".svg")){
    scale = pz_width / img_width
    let svg = get_svg_id(image_id)
    if(svg.hasAttributeNS(null,"width")){
      let client_width = svg.getAttributeNS(null,"width")
      if(client_width.endsWith("px")){
        client_width = Number(client_width.slice(0,-2))
      }
      scale = client_width / img_width
    }
  }
  console.log(`scale = ${scale}`)
  let offsetY         = pz_height/2 - (img_height*scale)/2
  let offsetX         = pz_width/2 - (img_width*scale)/2
  pzRef.moveTo(offsetX, offsetY);
  console.log(`moveTo (${offsetX},${offsetY})`)

  let fit_width_zoom  = pz_width/(img_width*scale)
  let zoomX           = pz_width/2
  let zoomY           = pz_height/2
  pzRef.zoomAbs(zoomX, zoomY, fit_width_zoom);
  console.log(`zoomAbs (${zoomX}, ${zoomY}, ${fit_width_zoom})`)
}

function Fit(image_id,pzRef,pz_width,pz_height){
  if(! pzRef) return
  //console.log("running fit")
  let {img_width, img_height} = get_size(image_id)
  let svg_ratio = img_width / img_height
  let box_ratio = pz_width / pz_height
  if(svg_ratio > box_ratio){
    FitWidth(image_id,pzRef,pz_width,pz_height)
  }else{
    FitHeight(image_id,pzRef,pz_width,pz_height)
  }
}
function Top(image_id,pzRef,pz_width,pz_height){
  if(! pzRef) return
  softReset(pzRef)
  let svg = get_svg_id(image_id)
  //let cbox = svg.getBoundingClientRect();
  let {img_width, img_height} = get_size(image_id)
  let scale = pz_width / img_width
  if(image_id.endsWith(".svg")){
    if(svg.hasAttributeNS(null,"width")){
      let client_width = svg.getAttributeNS(null,"width")
      if(client_width.endsWith("px")){
        client_width = Number(client_width.slice(0,-2))
      }
      scale = client_width / img_width
    }
  }
  //console.log(`scale = ${scale}`)
  let offsetY         = pz_height/2 - (img_height*scale)/2
  let offsetX         = pz_width/2 - (img_width*scale)/2
  pzRef.moveTo(offsetX, 0);
  //console.log(`moveTo (${offsetX},${offsetY})`)

  let cbox = svg.getBoundingClientRect();
  let fit_width_zoom  = pz_width/(img_width*scale)
  let zoomX           = pz_width/2
  let zoomY           = pz_height/2
  pzRef.zoomAbs(zoomX, zoomY, fit_width_zoom);
}

async function fetch_json(json_filename){
  const response = await fetch(`${config.basePath}/${json_filename}`)
  return await response.json()
}

function setup_links(svg_id,json_data){
    let svg = get_svg_id(svg_id)
    if(svg){
      let draw = SVGjs(svg)
      let text_nodes = draw.find('text')
      let text_array = [ ...text_nodes ];
      text_array.forEach((text)=>{
        const key = text.node.innerHTML
        if(key in json_data){
          //text.linkTo(json_data[key])//link in same page
          text.linkTo((link)=>{link.to(json_data[key]).target('_blank')})//link in new page
          text.css({'text-decoration': 'underline'})  
        }
      })
      //text.fill('#f06')
    }
    return
}

function flash_links(text_list,duration){
  text_list.forEach((text)=>{
    text.fill({color:'red'})
    setTimeout(()=>{
      text.fill({color:'#05236e'})  
    },duration)
  })
}

function get_title(svg_id){
      let svg = get_svg_id(svg_id)
      if(!svg){
        return ""
      }
      let title = ""
      let draw = SVGjs(svg)
      let title_nodes = draw.find('title')
      let title_array = [ ...title_nodes ];
      if(title_array.length > 0){
        title = title_array[0].node.innerHTML
      }
      return title
}

export{
  Fit,
  Top,
  softReset,
  Reset,
  Center,
  FitHeight,
  FitWidth,
  setup_links,
  flash_links,
  get_svg_id,
  get_title,
  fetch_json,
  search_to_query
}
