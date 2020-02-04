import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Environment, environment } from '@app/env';
import { SearchListResponse } from '@app/interfaces';

import { YoutubeService } from './youtube.service';

const data = require('./mock-response.json');

describe('YoutubeService', () => {
  const searchQuery = 'john';
  const mockResponse: SearchListResponse = data;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: Environment,
          useValue: environment,
        },
        YoutubeService
      ]
    });
  });

  it('should be created', () => {
    const service: YoutubeService = TestBed.get(YoutubeService);
    expect(service).toBeTruthy();
  });

  it('should get videos data', inject(
    [HttpTestingController, YoutubeService],
    (httpMock: HttpTestingController, youtubeService: YoutubeService) => {
      youtubeService.searchVideos(searchQuery).subscribe((videosResponse) => {
        expect(videosResponse).toEqual(mockResponse);
      });

      const mockReq = httpMock.expectOne(
        req => req.method === 'GET' && req.url === `${environment.google.baseUrl}/search`
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');

      mockReq.flush(mockResponse);

      httpMock.verify();
    }
  ));

  it('should make request with valid parameters', inject(
    [HttpTestingController, YoutubeService],
    (httpMock: HttpTestingController, youtubeService: YoutubeService) => {
      youtubeService.searchVideos(searchQuery).subscribe();

      const mockReq = httpMock.expectOne(
        req => req.method === 'GET' && req.url === `${environment.google.baseUrl}/search`
      );

      expect(mockReq.request.params.get('key')).toEqual(environment.google.apiKey);
      expect(mockReq.request.params.get('maxResults')).toEqual('50');
      expect(mockReq.request.params.get('part')).toEqual('snippet');

      httpMock.verify();
    }
  ));

  it('should make request with valid search query and next page token absent', inject(
    [HttpTestingController, YoutubeService],
    (httpMock: HttpTestingController, youtubeService: YoutubeService) => {
      youtubeService.searchVideos(searchQuery).subscribe();

      const mockReq = httpMock.expectOne(req => req.method === 'GET' && req.url === `${environment.google.baseUrl}/search`);

      expect(mockReq.request.params.get('q')).toEqual(searchQuery);
      expect(mockReq.request.params.get('pageToken')).toBeNull();

      httpMock.verify();
    }
  ));

  it('should make request with valid next page token param', inject(
    [HttpTestingController, YoutubeService],
    (httpMock: HttpTestingController, youtubeService: YoutubeService) => {
      const token = 'xyz';
      youtubeService.searchVideos(searchQuery, token).subscribe();

      const mockReq = httpMock.expectOne(req => req.method === 'GET' && req.url === `${environment.google.baseUrl}/search`);

      expect(mockReq.request.params.get('pageToken')).toEqual(token);

      httpMock.verify();
    }
  ));
});
