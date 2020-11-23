package cn.niter.forum.cache;

import net.jodah.expiringmap.ExpirationPolicy;
import net.jodah.expiringmap.ExpiringMap;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Component
public class VerifyImageCache {

    public static int VALID_IMAGE_TIMEOUT = 60;


    ExpiringMap<String,Integer> iamgeCode = ExpiringMap.builder()
            .maxSize(20)//最大容量，防止恶意注入
            .expiration(VALID_IMAGE_TIMEOUT, TimeUnit.SECONDS)//过期时间5分钟
            .expirationPolicy(ExpirationPolicy.CREATED)
            .variableExpiration()
            .build();


    public void putVerifyImage(String key, Integer position){
        iamgeCode.put(key,position);
    }

    public Integer getVerifyImage(String key){
        return iamgeCode.get(key);
    }

    public void deleteVerifyImage(String key){
        iamgeCode.remove(key);
    }

}
