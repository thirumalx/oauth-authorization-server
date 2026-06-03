package io.github.thirumalx.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.thirumalx.model.GenericCd;
import io.github.thirumalx.repository.dao.GenericCdDao;

/**
 * @author Thirumal
 *
 */
@RestController
@RequestMapping("lookup")
public class GenericCdController {

    private final Logger logger = LoggerFactory.getLogger(GenericCdController.class);

    private final GenericCdDao genericCdDao;

    public GenericCdController(GenericCdDao genericCdDao) {
        super();
        this.genericCdDao = genericCdDao;
    }

    @GetMapping("/{tableName}")
    public List<GenericCd> getGenericCds(@PathVariable String tableName,
            @RequestHeader(value = "User-Accept-Language", defaultValue = "en-IN") String locale) {
        logger.debug("Request to retrieve lookup values for table {}", tableName);
        return genericCdDao.list(tableName, locale);
    }

}
