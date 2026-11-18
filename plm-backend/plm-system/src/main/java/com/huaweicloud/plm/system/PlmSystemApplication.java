package com.huaweicloud.plm.system;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.huaweicloud.plm")
@MapperScan("com.huaweicloud.plm.system.mapper")
public class PlmSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlmSystemApplication.class, args);
    }
}
