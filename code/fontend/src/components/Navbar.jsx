import React,{useContext,useEffect,useState} from "react";
import {HiMenuAlt4} from "react-icons/hi";
import {AiOutlineClose}from "react-icons/ai";
// import {LoginModal} from "../App.jsx";
import logo from "../images/logo.png";
import {Avatar,Button,Progress,Descriptions,Drawer, Modal} from "antd";
import { Web3Provider, tokenAddress } from "../App";
import { BigNumber, ethers } from "ethers";
import  baseERC20 from "../ABI/baseERC20ABI.json";


const Navbar =(props)=>{
    const addresses = useContext(tokenAddress);
    const ethProvider=useContext(Web3Provider);
    const {isLogin,userInfo,setIsLogin,EOAInfo}=props;
    const[balancesProgress,setBalancesProgress]=useState(0);
    // console.log(props);
    // const {userModalView} =props;
    const [toggleMenu,setToggleMenu]=React.useState(false);
    const [DrawerView,setDrawerView]=useState(false);
    const [loadingForTime,setLoadingForTime]=useState(null);
    // const setLoginView=useContext(LoginModal);
    // const [loginState,setLoginState]=useState(false);
    const [balances,setBalances]=useState(new Map(Array.from(addresses.keys()).map((key) => [key, null])));
    useEffect(async()=>{
        await loadingBalances();
    },[])
    async function loadingBalances(){
        setBalancesProgress(0);
        let walk =100/addresses.size;
        try{
         addresses.forEach(async(value,key)=>{
            let balance =await getBalance(value);
             setBalances((pre)=>(pre.set(key,balance+key)))
             setBalancesProgress((pre)=>(pre+walk));
        })
    }catch(e){
        Modal.error({title:"error",content:"获取余额失败"});
        return
    }
    }
    useEffect(()=>{
        if(DrawerView){
           setLoadingForTime(setInterval(async()=>{await loadingBalances()},5000));
        }else{
            if(loadingForTime!=null){
                clearInterval(loadingForTime);
                setLoadingForTime(null);
            }
        }
    },[DrawerView])
    async function getBalance(src){
        if (src == '0x0000000000000000000000000000000000000000'){
           let eth= await ethProvider.getBalance(EOAInfo.wallet.address);
           return ethers.utils.formatEther(eth)
        }
        let contract= new ethers.Contract(src,baseERC20,ethProvider);
        let tokenNumber=""; 
        await contract.balanceOf(EOAInfo.wallet.address).then((data)=>{
            tokenNumber=ethers.utils.formatUnits(data,18);
        });
        return tokenNumber;
    }

    return(
        <>
        <nav className="w-full flex md:justify-center justify-between items-center p-4">
            <div className="md:flex-[0.5] flex-initial justify-center items-center">
                <img src={logo} alt="logo" className="w-32 cursor-pointer"/>
            </div>
            {isLogin? 
                <Avatar onClick={()=>{setDrawerView(true)}} style={{ backgroundColor: '#00a2ae', verticalAlign: 'middle' }} size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80 }}>
        {userInfo.username}
      </Avatar>:<></>}
            <div className="flex relative">
             {!toggleMenu &&(<HiMenuAlt4 fontSize={28} className="text-white md:hidden cursor-pointer" onClick={()=>setToggleMenu(true)} />)}
             {!toggleMenu &&(<AiOutlineClose fontSize={28} className="text-white md:hidden cursor-pointer " onClick={()=>setToggleMenu(false)} />)}
             {toggleMenu &&(<ul className="z-10 fixed -top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none
               flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in">
              <li className="text-xl w-full my-2"><AiOutlineClose  onClick={()=>setToggleMenu(false)} /></li>
              {["Market", "Exchange", "Tutorials", "Wallets"].map(
              (item, index) => <NavBarItem key={item + index} title={item} classprops="my-2 text-lg" />,
            )}
             </ul>)}
            </div>
        </nav>
        <Drawer style={{background:"",}}  open={DrawerView} onClose={()=>{setDrawerView(false)}}>
      
                <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="地址" selectable>
                       {EOAInfo.wallet!=null&&EOAInfo.wallet.address}
                    </Descriptions.Item>
                            {isLogin&&Array.from(addresses.keys()).map((value,index)=><Descriptions.Item key={value} label={value}>{balances.get(value)}</Descriptions.Item>)}
                    <Descriptions.Item>
                   <Descriptions.Item>
                   <Progress percent={balancesProgress} size="small" />
                   </Descriptions.Item>
                    <Button className=" w-full cursor-pointer" onClick={()=>{setIsLogin(false);setDrawerView(false)}}>退出登录</Button>
                    </Descriptions.Item>
                </Descriptions>     
        </Drawer>
        </>
    )
}
export default Navbar;