/** @jsx createElement */
import { createElement, render, reactive, ref } from 'axii'
import Icon from '../src/icon/Icon.jsx'
import Radios from '../src/radios/Radios.jsx'


const allIconNames = ["IconProvider","VerticalAlignBottom","VerticalAlignMiddle","VerticalAlignTop","VerticalLeft","VerticalRight","VideoCameraAdd","VideoCamera","Wallet","Warning","Wechat","WeiboCircle","Weibo","WeiboSquare","WhatsApp","Wifi","Windows","Woman","Yahoo","Youtube","Yuque","ZhihuCircle","Zhihu","ZhihuSquare","ZoomIn","ZoomOut","Tags","TaobaoCircle","Taobao","TaobaoSquare","Team","Thunderbolt","ToTop","Tool","TrademarkCircle","Trademark","Transaction","Translation","Trophy","TwitterCircle","Twitter","TwitterSquare","Underline","Undo","Ungroup","Unlock","UnorderedList","UpCircle","Up","UpSquare","Upload","Usb","UserAdd","UserDelete","User","UserSwitch","UsergroupAdd","UsergroupDelete","Verified","SlackCircle","Slack","SlackSquare","Sliders","SmallDash","Smile","Snippets","Solution","SortAscending","SortDescending","Sound","SplitCells","Star","StepBackward","StepForward","Stock","Stop","Strikethrough","Subnode","SwapLeft","Swap","SwapRight","Switcher","Sync","Table","Tablet","Tag","Rise","Robot","Rocket","Rollback","RotateLeft","RotateRight","SafetyCertificate","Safety","Save","Scan","Schedule","Scissor","Search","SecurityScan","Select","Send","Setting","Shake","ShareAlt","Shop","ShoppingCart","Shopping","Shrink","Signal","Sisternode","SketchCircle","Sketch","SketchSquare","Skin","Skype","Profile","Project","PropertySafety","PullRequest","Pushpin","QqCircle","Qq","QqSquare","Qrcode","QuestionCircle","Question","RadarChart","RadiusBottomleft","RadiusBottomright","RadiusSetting","RadiusUpleft","RadiusUpright","Read","Reconciliation","RedEnvelope","RedditCircle","Reddit","RedditSquare","Redo","Reload","Rest","Retweet","RightCircle","Right","RightSquare","NodeIndex","Notification","Number","OneToOne","OrderedList","PaperClip","Partition","PauseCircle","Pause","PayCircle","Percentage","Phone","PicCenter","PicLeft","PicRight","Picture","PieChart","PlayCircle","PlaySquare","PlusCircle","Plus","PlusSquare","PoundCircle","Pound","Poweroff","Printer","Link","Linkedin","Loading3Quarters","Loading","Lock","Login","Logout","MacCommand","Mail","Man","MedicineBox","MediumCircle","Medium","MediumSquare","MediumWorkmark","Meh","MenuFold","Menu","MenuUnfold","MergeCells","Message","MinusCircle","Minus","MinusSquare","Mobile","MoneyCollect","Monitor","More","NodeCollapse","NodeExpand","Hourglass","Html5","Idcard","IeCircle","Ie","IeSquare","Import","Inbox","InfoCircle","Info","InsertRowAbove","InsertRowBelow","InsertRowLeft","InsertRowRight","Instagram","Insurance","Interaction","IssuesClose","Italic","Key","Laptop","Layout","LeftCircle","Left","LeftSquare","Like","LineChart","LineHeight","Line","Forward","Frown","FullscreenExit","Fullscreen","Function","Fund","FundProjectionScreen","FundView","FunnelPlot","Gateway","Gif","Gift","Github","Gitlab","Global","Gold","Golden","GoogleCircle","Google","GooglePlusCircle","GooglePlus","GooglePlusSquare","GoogleSquare","Group","Hdd","Heart","HeatMap","Highlight","History","Home","FileMarkdown","File","FilePdf","FilePpt","FileProtect","FileSearch","FileSync","FileText","FileUnknown","FileWord","FileZip","Filter","Fire","Flag","FolderAdd","Folder","FolderOpen","FolderView","FontColors","FontSize","Fork","Form","FormatPainter","EuroCircle","Euro","Exception","ExclamationCircle","Exclamation","ExpandAlt","Expand","Experiment","Export","Eye","EyeInvisible","Facebook","Fall","FastBackward","FastForward","FieldBinary","FieldNumber","FieldString","FieldTime","FileAdd","FileDone","FileExcel","FileExclamation","FileGif","FileImage","FileJpg","Delete","DeleteRow","DeliveredProcedure","DeploymentUnit","Desktop","Diff","Dingding","DingtalkCircle","Dingtalk","DingtalkSquare","Disconnect","Dislike","DollarCircle","Dollar","DotChart","DoubleLeft","DoubleRight","DownCircle","Down","DownSquare","Download","Drag","DribbbleCircle","Dribbble","DribbbleSquare","DropboxCircle","Dropbox","DropboxSquare","Edit","Ellipsis","Enter","Environment","CodeSandboxSquare","Code","CodepenCircle","Codepen","CodepenSquare","Coffee","ColumnHeight","ColumnWidth","Comment","Compass","Compress","ConsoleSql","Contacts","Container","Control","Copy","CopyrightCircle","Copyright","CreditCard","Crown","CustomerService","Dash","Dashboard","Database","DeleteColumn","Car","CaretDown","CaretLeft","CaretRight","CaretUp","CarryOut","CheckCircle","Check","CheckSquare","Chrome","CiCircle","Ci","Clear","ClockCircle","CloseCircle","Close","CloseSquare","CloudDownload","Cloud","CloudServer","CloudSync","CloudUpload","Cluster","CodeSandboxCircle","CodeSandbox","Bank","BarChart","Barcode","Bars","BehanceCircle","Behance","BehanceSquare","Bell","BgColors","Block","Bold","Book","BorderBottom","BorderHorizontal","BorderInner","BorderLeft","BorderOuter","Border","BorderRight","BorderTop","BorderVerticle","BorderlessTable","BoxPlot","Branches","Bug","Build","Bulb","Calculator","Calendar","Camera","AccountBook","Aim","Alert","Alibaba","AlignCenter","AlignLeft","AlignRight","AlipayCircle","Alipay","AlipaySquare","Aliwangwang","Aliyun","AmazonCircle","Amazon","AmazonSquare","Android","AntCloud","AntDesign","Apartment","Api","Apple","AppstoreAdd","Appstore","AreaChart","ArrowDown","ArrowLeft","ArrowRight","ArrowUp","ArrowsAlt","Audio","AudioMuted","Audit","Backward","setColor","getColor"]

function App() {
  const theme = ref('outlined')
  const color = ref('#666')
  const size = ref(24)

  const themeOptions = ['outlined', 'filled', 'twoTone']

  return <div>
    <div>
      <div>
        <span>theme: </span>
        <Radios value={theme} options={themeOptions}/>
      </div>
    </div>
    {allIconNames.map(type => (
      <container inline inline-text-align-center inline-width-160px inline-margin-bottom-20px>
        <Icon type={type} color={color} size={size} theme={theme}/>
        <name block>{type}</name>
      </container>
    ))}
  </div>
}

render(<App></App>, document.getElementById('root'))
