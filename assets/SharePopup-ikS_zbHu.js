import{c as X,b as Y,v as f,R as F,w as h,x as k,C as v,S,T as _,y as w,F as d,e as b,A as q,r as g}from"./index-DCLeewwT.js";import{R as E}from"./RoundedBox-BiRQtGDu.js";import{F as y}from"./Filter-C5D4Qhzg.js";const B={5:[.153388,.221461,.250301],7:[.071303,.131514,.189879,.214607],9:[.028532,.067234,.124009,.179044,.20236],11:[.0093,.028002,.065984,.121703,.175713,.198596],13:[.002406,.009255,.027867,.065666,.121117,.174868,.197641],15:[489e-6,.002403,.009246,.02784,.065602,.120999,.174697,.197448]},L=["in vec2 vBlurTexCoords[%size%];","uniform sampler2D uTexture;","out vec4 finalColor;","void main(void)","{","    finalColor = vec4(0.0);","    %blur%","}"].join(`
`);function U(l){const t=B[l],e=t.length;let r=L,n="";const a="finalColor += texture(uTexture, vBlurTexCoords[%index%]) * %value%;";let i;for(let s=0;s<l;s++){let u=a.replace("%index%",s.toString());i=s,s>=e&&(i=l-s-1),u=u.replace("%value%",t[i].toString()),n+=u,n+=`
`}return r=r.replace("%blur%",n),r=r.replace("%size%",l.toString()),r}const G=`
    in vec2 aPosition;

    uniform float uStrength;

    out vec2 vBlurTexCoords[%size%];

    uniform vec4 uInputSize;
    uniform vec4 uOutputFrame;
    uniform vec4 uOutputTexture;

    vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;

    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

    vec2 filterTextureCoord( void )
    {
        return aPosition * (uOutputFrame.zw * uInputSize.zw);
    }

    void main(void)
    {
        gl_Position = filterVertexPosition();

        float pixelStrength = uInputSize.%dimension% * uStrength;

        vec2 textureCoord = filterTextureCoord();
        %blur%
    }`;function V(l,t){const e=Math.ceil(l/2);let r=G,n="",a;t?a="vBlurTexCoords[%index%] =  textureCoord + vec2(%sampleIndex% * pixelStrength, 0.0);":a="vBlurTexCoords[%index%] =  textureCoord + vec2(0.0, %sampleIndex% * pixelStrength);";for(let i=0;i<l;i++){let s=a.replace("%index%",i.toString());s=s.replace("%sampleIndex%",`${i-(e-1)}.0`),n+=s,n+=`
`}return r=r.replace("%blur%",n),r=r.replace("%size%",l.toString()),r=r.replace("%dimension%",t?"z":"w"),r}function $(l,t){const e=V(t,l),r=U(t);return X.from({vertex:e,fragment:r,name:`blur-${l?"horizontal":"vertical"}-pass-filter`})}var R=`

struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct BlurUniforms {
  uStrength:f32,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> blurUniforms : BlurUniforms;


struct VSOutput {
    @builtin(position) position: vec4<f32>,
    %blur-struct%
  };

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);  
}

fn getSize() -> vec2<f32>
{
  return gfu.uGlobalFrame.zw;
}


@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {

  let filteredCord = filterTextureCoord(aPosition);

  let pixelStrength = gfu.uInputSize.%dimension% * blurUniforms.uStrength;

  return VSOutput(
   filterVertexPosition(aPosition),
    %blur-vertex-out%
  );
}

@fragment
fn mainFragment(
  @builtin(position) position: vec4<f32>,
  %blur-fragment-in%
) -> @location(0) vec4<f32> {

    var   finalColor = vec4(0.0);

    %blur-sampling%

    return finalColor;
}`;function M(l,t){const e=B[t],r=e.length,n=[],a=[],i=[];for(let o=0;o<t;o++){n[o]=`@location(${o}) offset${o}: vec2<f32>,`,l?a[o]=`filteredCord + vec2(${o-r+1} * pixelStrength, 0.0),`:a[o]=`filteredCord + vec2(0.0, ${o-r+1} * pixelStrength),`;const O=o<r?o:t-o-1,I=e[O].toString();i[o]=`finalColor += textureSample(uTexture, uSampler, offset${o}) * ${I};`}const s=n.join(`
`),u=a.join(`
`),p=i.join(`
`),c=R.replace("%blur-struct%",s).replace("%blur-vertex-out%",u).replace("%blur-fragment-in%",s).replace("%blur-sampling%",p).replace("%dimension%",l?"z":"w");return Y.from({vertex:{source:c,entryPoint:"mainVertex"},fragment:{source:c,entryPoint:"mainFragment"}})}const T=class P extends y{constructor(t){t={...P.defaultOptions,...t};const e=$(t.horizontal,t.kernelSize),r=M(t.horizontal,t.kernelSize);super({glProgram:e,gpuProgram:r,resources:{blurUniforms:{uStrength:{value:0,type:"f32"}}},...t}),this.horizontal=t.horizontal,this._quality=0,this.quality=t.quality,this.blur=t.strength,this._uniforms=this.resources.blurUniforms.uniforms}apply(t,e,r,n){if(this._uniforms.uStrength=this.strength/this.passes,this.passes===1)t.applyFilter(this,e,r,n);else{const a=f.getSameSizeTexture(e);let i=e,s=a;this._state.blend=!1;const u=t.renderer.type===F.WEBGPU;for(let p=0;p<this.passes-1;p++){t.applyFilter(this,i,s,p===0?!0:u);const c=s;s=i,i=c}this._state.blend=!0,t.applyFilter(this,i,r,n),f.returnTexture(a)}}get blur(){return this.strength}set blur(t){this.padding=1+Math.abs(t)*2,this.strength=t}get quality(){return this._quality}set quality(t){this._quality=t,this.passes=t}};T.defaultOptions={strength:8,quality:4,kernelSize:5};let m=T;class C extends y{constructor(...t){let e=t[0]??{};typeof e=="number"&&(h(k,"BlurFilter constructor params are now options object. See params: { strength, quality, resolution, kernelSize }"),e={strength:e},t[1]!==void 0&&(e.quality=t[1]),t[2]!==void 0&&(e.resolution=t[2]||"inherit"),t[3]!==void 0&&(e.kernelSize=t[3])),e={...m.defaultOptions,...e};const{strength:r,strengthX:n,strengthY:a,quality:i,...s}=e;super({...s,compatibleRenderers:F.BOTH,resources:{}}),this._repeatEdgePixels=!1,this.blurXFilter=new m({horizontal:!0,...e}),this.blurYFilter=new m({horizontal:!1,...e}),this.quality=i,this.strengthX=n??r,this.strengthY=a??r,this.repeatEdgePixels=!1}apply(t,e,r,n){const a=Math.abs(this.blurXFilter.strength),i=Math.abs(this.blurYFilter.strength);if(a&&i){const s=f.getSameSizeTexture(e);this.blurXFilter.blendMode="normal",this.blurXFilter.apply(t,e,s,!0),this.blurYFilter.blendMode=this.blendMode,this.blurYFilter.apply(t,s,r,n),f.returnTexture(s)}else i?(this.blurYFilter.blendMode=this.blendMode,this.blurYFilter.apply(t,e,r,n)):(this.blurXFilter.blendMode=this.blendMode,this.blurXFilter.apply(t,e,r,n))}updatePadding(){this._repeatEdgePixels?this.padding=0:this.padding=Math.max(Math.abs(this.blurXFilter.blur),Math.abs(this.blurYFilter.blur))*2}get strength(){if(this.strengthX!==this.strengthY)throw new Error("BlurFilter's strengthX and strengthY are different");return this.strengthX}set strength(t){this.blurXFilter.blur=this.blurYFilter.blur=t,this.updatePadding()}get quality(){return this.blurXFilter.quality}set quality(t){this.blurXFilter.quality=this.blurYFilter.quality=t}get strengthX(){return this.blurXFilter.blur}set strengthX(t){this.blurXFilter.blur=t,this.updatePadding()}get strengthY(){return this.blurYFilter.blur}set strengthY(t){this.blurYFilter.blur=t,this.updatePadding()}get blur(){return h("8.3.0","BlurFilter.blur is deprecated, please use BlurFilter.strength instead."),this.strength}set blur(t){h("8.3.0","BlurFilter.blur is deprecated, please use BlurFilter.strength instead."),this.strength=t}get blurX(){return h("8.3.0","BlurFilter.blurX is deprecated, please use BlurFilter.strengthX instead."),this.strengthX}set blurX(t){h("8.3.0","BlurFilter.blurX is deprecated, please use BlurFilter.strengthX instead."),this.strengthX=t}get blurY(){return h("8.3.0","BlurFilter.blurY is deprecated, please use BlurFilter.strengthY instead."),this.strengthY}set blurY(t){h("8.3.0","BlurFilter.blurY is deprecated, please use BlurFilter.strengthY instead."),this.strengthY=t}get repeatEdgePixels(){return this._repeatEdgePixels}set repeatEdgePixels(t){this._repeatEdgePixels=t,this.updatePadding()}}C.defaultOptions={strength:8,quality:4,kernelSize:5};let z="",x="";function D(l,t){x=l,z=t}class N extends v{bg;panel;panelBase;doneButton;titleLabell;statsText;mapSprite;twitterBtn;threadsBtn;linkedinBtn;nativeShareBtn;shareText="";base64Image="";constructor(){super(),this.bg=new S(_.WHITE),this.bg.tint=0,this.bg.interactive=!0,this.addChild(this.bg),this.panel=new v,this.addChild(this.panel),this.panelBase=new E({width:600,height:550}),this.panel.addChild(this.panelBase),this.titleLabell=new w({text:"Share Your City",style:{fill:15471969,fontSize:36,fontWeight:"bold"}}),this.titleLabell.anchor.set(.5),this.titleLabell.y=-220,this.panel.addChild(this.titleLabell),this.statsText=new w({text:"",style:{fill:16777215,fontSize:18,align:"center",wordWrap:!0,wordWrapWidth:500}}),this.statsText.anchor.set(.5),this.statsText.y=-150,this.panel.addChild(this.statsText),this.mapSprite=new S,this.mapSprite.anchor.set(.5),this.mapSprite.y=20,this.panel.addChild(this.mapSprite),this.twitterBtn=new d({text:"Twitter",width:120,height:40,fontSize:16,backgroundColor:1942002}),this.twitterBtn.x=-200,this.twitterBtn.y=190,this.twitterBtn.onPress.connect(()=>this.shareToTwitter()),this.panel.addChild(this.twitterBtn),this.threadsBtn=new d({text:"Threads",width:120,height:40,fontSize:16,backgroundColor:0}),this.threadsBtn.x=-66,this.threadsBtn.y=190,this.threadsBtn.onPress.connect(()=>this.shareToThreads()),this.panel.addChild(this.threadsBtn),this.linkedinBtn=new d({text:"LinkedIn",width:120,height:40,fontSize:16,backgroundColor:681666}),this.linkedinBtn.x=66,this.linkedinBtn.y=190,this.linkedinBtn.onPress.connect(()=>this.shareToLinkedIn()),this.panel.addChild(this.linkedinBtn),this.nativeShareBtn=new d({text:"Image",width:120,height:40,fontSize:16,backgroundColor:2600544}),this.nativeShareBtn.x=200,this.nativeShareBtn.y=190,this.nativeShareBtn.onPress.connect(()=>this.shareNative()),this.panel.addChild(this.nativeShareBtn),this.doneButton=new d({text:"Close",width:120,height:45,fontSize:18,backgroundColor:3447003}),this.doneButton.y=260,this.doneButton.onPress.connect(()=>b().navigation.dismissPopup()),this.panel.addChild(this.doneButton),x&&this.setData(x,z)}setData(t,e){this.shareText=e,this.base64Image=t,this.statsText.text=e,q.load(t).then(r=>{this.mapSprite.texture=r;const n=500/r.width,a=250/r.height,i=Math.min(n,a,1);this.mapSprite.scale.set(i)}),navigator.canShare||(this.nativeShareBtn.text="Download Image")}shareToTwitter(){const t=`https://x.com/intent/tweet?text=${encodeURIComponent(this.shareText)}`;window.open(t,"_blank")}shareToThreads(){const t=`https://www.threads.net/intent/post?text=${encodeURIComponent(this.shareText)}`;window.open(t,"_blank")}shareToLinkedIn(){const t=`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;window.open(t,"_blank")}async shareNative(){try{if(this.base64Image){const e=await(await fetch(this.base64Image)).blob(),r=new File([e],"metromap-city.png",{type:"image/png"});if(navigator.canShare&&navigator.canShare({files:[r]}))await navigator.share({title:"MetroMap.io City",text:this.shareText,files:[r]});else{const n=document.createElement("a");n.href=this.base64Image,n.download="metromap-city.png",n.click()}}}catch(t){console.error("Failed to share",t)}}resize(t,e){this.bg.width=t,this.bg.height=e,this.panel.x=t*.5,this.panel.y=e*.5}async show(){const t=b();t.navigation.currentScreen&&(t.navigation.currentScreen.filters=[new C({strength:5})]),this.bg.alpha=0,this.panel.pivot.y=-600,g(this.bg,{alpha:.8},{duration:.2,ease:"linear"}),await g(this.panel.pivot,{y:0},{duration:.3,ease:"backOut"})}async hide(){const t=b();t.navigation.currentScreen&&(t.navigation.currentScreen.filters=[]),g(this.bg,{alpha:0},{duration:.2,ease:"linear"}),await g(this.panel.pivot,{y:-800},{duration:.3,ease:"backIn"})}}export{N as SharePopup,D as setShareDataForPopup};
