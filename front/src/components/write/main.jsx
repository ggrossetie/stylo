import React, { Component } from 'react';
import objectAssign from 'object-assign';
import sortByIdDesc from 'helpers/sorts/idDesc';
import YamlEditor from 'components/yamleditor/YamlEditor';
import Timeline from 'components/write/Timeline';
import Sommaire from 'components/write/Sommaire';
import Biblio from 'components/write/Biblio';
import {Controlled as CodeMirror} from 'react-codemirror2';
import promptUser from 'helpers/UI/prompt';
require('codemirror/mode/markdown/markdown');

export default class Write extends Component {
  constructor(props) {
    super(props);
    this.instance = null;
    //set state
    this.state = {loaded:false,live:{yaml:"",md:"",bib:""},active:{yaml:"",md:"",bib:""},activeId:this.props.match.params.version,article:{versions:[]}};
    this.exportVersion = this.exportVersion.bind(this);
    this.setCodeMirrorCursor = this.setCodeMirrorCursor.bind(this);
    this.fetchAPI = this.fetchAPI.bind(this);
    this.tagVersion = this.tagVersion.bind(this);
    this.toggleYamlEditor = this.toggleYamlEditor.bind(this);
    this.toggleEditorYaml = this.toggleEditorYaml.bind(this);
    this.fetchAPI();
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.activeId != this.props.match.params.version || this.state.compute){
      let newActive;
      if(this.props.match.params.version == undefined){
        //set the live as the active view
        newActive = objectAssign({},this.state.live);
      }
      else{
        //find the correct version
        let that = this;
        newActive = objectAssign({yaml:'',md:'',bib:''},this.state.article.versions.find(function(version){return that.props.match.params.version == version.id;}));
      }
      this.setState({activeId:this.props.match.params.version,active:newActive,compute:false});
    }
  }

  fetchAPI(){
    let that = this;
    fetch('/api/v1/articles/'+this.props.match.params.article,{
      method:'GET',
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      json.versions = [...json.versions].sort(sortByIdDesc);
      let live = objectAssign({},json.versions[0]);
      that.setState({loaded:true,article:json,live,compute:true});
      return null;
    });
  }

  exportVersion(exportTarget="HTML"){
          if(exportTarget== "hypothes.is"){
            window.open('https://via.hypothes.is/'+window.location.protocol+'//'+window.location.hostname+'/api/v1/previewVersion/'+this.state.active.id,'_blank');
          }
          else if(exportTarget=="eruditXML"){
            window.open('https://ecrituresnumeriques.github.io/saxon-xsl-transform/?source='+window.location.protocol+'//'+window.location.hostname+'/api/v1/previewVersion/'+this.state.active.id,'_blank');
          }
          else if(exportTarget=="previewHTML"){
            window.open('/api/v1/htmlVersion/'+this.state.active.id+'?preview=true','_blank');
          }
          else if(exportTarget=="ZIP"){
            window.open('/api/v1/zipVersion/'+this.state.active.id,'_blank');
          }
          else{
            window.open('/api/v1/htmlVersion/'+this.state.active.id,'_blank');
          }
      return null;
  }

  tagVersion(){
      const that = this;
      const callback = function(title){
          fetch('/api/v1/versions/'+that.state.activeId,{
              method:'PATCH',
              body: JSON.stringify({title:title}),
              credentials: 'same-origin'
          })
          .then(function(response){
              return response.json();
          })
          .then(function(json){
              return json.title;
          });
          return title;
      };
      const title = promptUser('Tag this versions',this.state.active.title || this.state.active.version+"."+this.state.active.revision,callback);
      this.setState(function(state){
          let newState = objectAssign({},state);
          newState.active.title = title;
          //find out why this mutate any state when going to live
          let versions = [...newState.article.versions];
          versions.find(function(version){return that.state.active.id == version.id;}).title = title;
          const returnState = objectAssign({},newState);
          //active.title = title;
          return returnState;
      });
  }
  toggleYamlEditor(){
      this.setState({yamlEditor:!this.state.yamlEditor});
  }
  toggleEditorYaml(){
      this.setState({editorYaml:!this.state.editorYaml});
  }
  setCodeMirrorCursor(line){
      this.instance.focus();
      this.instance.setCursor(line,0);
  }

  render() {
    return ([
        <aside id="yamlEditor" key="yamlEditor">
          {!this.state.yamlEditor && <nav className="open" onClick={()=>this.toggleYamlEditor()}>Metadata</nav>}
          {this.state.yamlEditor && <nav className="close" onClick={()=>this.toggleYamlEditor()}>close</nav>}
          {this.state.yamlEditor && <nav className="toggleEditor" onClick={()=>this.toggleEditorYaml()}>Mode authors/editor</nav>}
          {this.state.yamlEditor && <YamlEditor editor={this.state.editorYaml} yaml={this.state.active.yaml}/>}
        </aside>,
        <h1 id="title" key="title">{this.state.article.title} ({this.state.loaded?"Up to Date":"Fetching"})</h1>,
      <section id="writeComponent" key="aside">
          <Timeline activeId={this.state.activeId}
              active={this.state.active}
              article={this.props.match.params.article}
              versions={this.state.article.versions}
              tagVersion={this.tagVersion}
              exportHTML={()=>this.exportVersion("HTML")}
              exportZIP={()=>this.exportVersion("ZIP")}
              previewHTML={()=>this.exportVersion("previewHTML")}
              exportHypothesis={()=>this.exportVersion("hypothes.is")}
              exportErudit={()=>this.exportVersion("eruditXML")}
          />
          <Sommaire md={this.state.active.md} setCursor={this.setCodeMirrorCursor}/>
          <Biblio bib={this.state.active.bib}/>
      </section>,
      <section id="input" key="input">
          <CodeMirror value={this.state.active.md} options={{mode:'markdown',lineWrapping:true,viewportMargin:Infinity,autofocus:true}} editorDidMount={editor => { this.instance = editor; }}/>
          <textarea value={this.state.active.yaml} disabled={true} placeholder="YAML editor" />
          <textarea value={this.state.active.bib} disabled={true} placeholder="BIBtext" />
      </section>
    ]);
  }
}
