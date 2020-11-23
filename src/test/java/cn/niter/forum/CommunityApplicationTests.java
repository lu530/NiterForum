package cn.niter.forum;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;


public class CommunityApplicationTests {

    public void contextLoads() {
    }


    public static void main(String[] args){
       System.out.println(Math.abs(90 - 100));
        boolean flag = Math.abs(90 - 100) < 2;
        System.out.println(flag);
    }

}
