package cn.niter.forum.controller;


import cn.niter.forum.cache.AppUserCache;
import cn.niter.forum.cache.VerifyImageCache;
import cn.niter.forum.constant.ConstString;
import cn.niter.forum.dto.PictureTemplagtesCutDto;
import cn.niter.forum.dto.UserDTO;
import cn.niter.forum.exception.CustomizeErrorCode;
import cn.niter.forum.exception.CustomizeException;
import cn.niter.forum.model.User;
import cn.niter.forum.model.UserAccount;
import cn.niter.forum.service.UserAccountService;
import cn.niter.forum.service.UserService;
import cn.niter.forum.util.CookieUtils;
import cn.niter.forum.util.TokenUtils;
import cn.niter.forum.util.VerifyImageUtil;
import cn.niter.forum.vo.EmailVerificationCodeVo;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.apache.commons.io.FileUtils;
import org.apache.tomcat.util.http.ResponseUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.*;
import sun.plugin2.message.Message;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * @author wadao
 * @version 2.0
 * @date 2020/5/1 17:32
 * @site niter.cn
 */
//@Api(tags={"登录注册接口"})
@Controller
public class SSOController {
    @Value("${vaptcha.vid}")
    private String vaptcha_vid;
    @Value("${jiguang.sms.enable}")
    private Integer smsEnable;
    @Autowired
    private AppUserCache appUserCache;

    @Autowired
    private UserService userService;
    @Autowired
    private UserAccountService userAccountService;
    @Autowired
    private TokenUtils tokenUtils;
    @Autowired
    private CookieUtils cookieUtils;

    @Autowired
    private VerifyImageCache verifyImageCache;

  /*  @ResponseBody//@ResponseBody返回json格式的数据
    @RequestMapping(value = "/api/sso/login", method = RequestMethod.POST)
    public Object login(HttpServletRequest request,
                           @RequestParam("name") String name,
                           @RequestParam("password") String password,
                           @RequestParam("type") Integer type,
                        HttpServletResponse response) {
        ResultDTO resultDTO = (ResultDTO)userService.login(type,name,password);
        if(200==resultDTO.getCode()){
            Cookie cookie = cookieUtils.getCookie("token",""+resultDTO.getData(),86400*3);
            response.addCookie(cookie);
        }
        return resultDTO;
    }*/







    @RequestMapping("/sso/{action}")
    public String aouth(HttpServletRequest request,
                         HttpServletResponse response,
                        @PathVariable(name = "action") String action,
                        Model model) {
       // System.out.println("请求"+request.getAttribute("isOk"));
       // if(isOk==null) return "redirect:/";
        //System.out.println(isOk);
        UserDTO user = (UserDTO)request.getAttribute("loginUser");
        if(user != null) {
            return "redirect:/forum";
        }
        model.addAttribute("vaptcha_vid", vaptcha_vid);
        if("login".equals(action)){
            model.addAttribute("initOssType", 3);
            model.addAttribute("section", "login");
            model.addAttribute("sectionName", "登录");
           // return "/user/login";
        }
        else if("register".equals(action)){
            model.addAttribute("initOssType", 2);
            model.addAttribute("section", "register");
            model.addAttribute("sectionName", "注册");
          //  return "/user/reg";
        }
        else {
            return "redirect:/forum";
        }
        model.addAttribute("smsEnable", smsEnable);
       return "user/sso";
    }

    @RequestMapping("/sso/appConfirm")
    public String qrcodeStr(HttpServletRequest request,
                        HttpServletResponse response,
                        @RequestParam(name = "qrcodeStr") String qrcodeStr,
                        Model model) {
        UserDTO user = (UserDTO)request.getAttribute("loginUser");
        if (user == null) {
            throw new CustomizeException(CustomizeErrorCode.NO_LOGIN);
        }
        model.addAttribute("qrcodeStr", qrcodeStr);
       // System.out.println("qrcodeStr:"+qrcodeStr);
        return "user/appConfirm";
    }

    @PostMapping("/sso/putQrcodeStr")
    @ResponseBody
    public Map<String,Object> putQrcodeStr(HttpServletRequest request,
                                                   @RequestParam(name = "qrcodeStr") String qrcodeStr) {

        UserDTO loginUser = (UserDTO)request.getAttribute("loginUser");
        if (loginUser == null) {
            throw new CustomizeException(CustomizeErrorCode.NO_LOGIN);
        }

        Map<String,Object> map  = new HashMap<>();
        User user=userService.selectUserByUserId(loginUser.getId());
        UserDTO userDTO = new UserDTO();
        BeanUtils.copyProperties(user,userDTO);
        UserAccount userAccount = userAccountService.selectUserAccountByUserId(user.getId());
        userDTO.setGroupId(userAccount.getGroupId());
        userDTO.setVipRank(userAccount.getVipRank());
       // String token = user.getToken();
        //System.out.println("token:"+token);
        appUserCache.put(qrcodeStr,tokenUtils.getToken(userDTO));
       // System.out.println("cachetoken:"+appUserCache.get(qrcodeStr));
        map.put("success",1);
        return map;

    }

    @GetMapping("/sso/appConfirmResult")
    @ResponseBody
    public Map<String,Object> appConfirmResult(HttpServletRequest request,
                                           @RequestParam(name = "qrcodeStr") String qrcodeStr) {

         //System.out.println("qrcodeStr2:"+qrcodeStr);
        Map<String,Object> map  = new HashMap<>();
        String token = appUserCache.get(qrcodeStr);
        if(token==null||"".equals(token))
                  map.put("success",0);
        else{
            map.put("success",1);
            map.put("token",token);
           // System.out.println("token2:"+token);
        }
        return map;

    }


    //@RequestBody EmailVerificationCodeVo vo
  //  @ApiOperation(value = "获取滑动验证图片", notes = "错误会返回401错误")
    @RequestMapping("createImgValidate")
    @ResponseBody
    public Map<String,Object> createImgValidate(String email){
        Map<String, Object> result = new HashMap<String, Object>();
        try {
            Integer templateNum = new Random().nextInt(4) + 1;
            Integer targetNum = new Random().nextInt(20) + 1;
            File templateFile = ResourceUtils.getFile("classpath:static/images/validate/template/"+templateNum+".png");
            File targetFile = ResourceUtils.getFile("classpath:static/images/validate/target/"+targetNum+".jpg");
            PictureTemplagtesCutDto pictureTemplagtesCutDto = VerifyImageUtil.pictureTemplatesCut(templateFile, targetFile,
                    ConstString.IMAGE_TYPE_PNG, ConstString.IMAGE_TYPE_JPG);
            // 将生成的偏移位置信息设置到redis中
            String key = ConstString.WEB_VALID_IMAGE_PREFIX + email;
            Integer mailCode = verifyImageCache.getVerifyImage(key);
            if(null != mailCode && mailCode > 0){
                verifyImageCache.deleteVerifyImage(key);
            }
            verifyImageCache.putVerifyImage(key, pictureTemplagtesCutDto.getX());
            System.out.println(" verifyImageCache key " + key + " value:" + verifyImageCache.getVerifyImage(key) + " pictureTemplagtesCutDto.getX() " + pictureTemplagtesCutDto.getX());
            result.put("status", 200);
            result.put("data", pictureTemplagtesCutDto.getPictureMap());
            return result;
        } catch (Exception e) {
            result.put("status", 504);
            e.printStackTrace();
            return result;
        }
    }


    /**
     * 跳转到图片验证界面
     * @return 图片验证界面
     */
    @RequestMapping("imgValidate")
    public String toImgValidate(ModelMap map, String email){
        map.addAttribute("telephone",email);
        return "common/imageValidate";
    }


    /**
     * 跳转到图片验证界面
     * @return 图片验证界面
     */
    @ResponseBody
    @RequestMapping("checkImgValidate")
    public Map<String,Object> checkImgValidate(String telephone, int offsetHorizontal){
        Map<String, Object> result = new HashMap<String, Object>();
        String key = ConstString.WEB_VALID_IMAGE_PREFIX + telephone;
        Integer verifyImage = verifyImageCache.getVerifyImage(key);
        System.out.println("key:" + key + " offsetHorizontal:" + offsetHorizontal + " verifyImage :" + verifyImage);
        if(null !=verifyImage && Math.abs(verifyImage - offsetHorizontal) < 2){
            result.put("status", 200);
            result.put("info"," 验证通过！");
        }
        return result;
    }







}
